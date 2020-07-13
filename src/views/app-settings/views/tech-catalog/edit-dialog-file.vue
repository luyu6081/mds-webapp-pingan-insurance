<template>
  <el-dialog :visible.sync="isVisible"
             custom-class="edit-tech-file-view"
             @close="handleClose">
    <template #title>
      <h3 class="text-center font-semibold text-gray-darkest text-2xl">{{dialogTitle}}</h3>
    </template>

    <step-bar :activeStep="step"
              :stepList="[{step: 1, title: '创建类目'},
                          {step: 2, title: '设置数据'},
                          {step: 3, title: dataTypeFlag === mdsObjectTypeEnum.database && sourceActiveName === 'dataSourceTab' ? '更新策略' : '信息预览'},
                          {step: 3, title: '完成'}]"/>

    <el-form ref="fileDetailForm" :rules="rules" :model="fileDetailForm">
      <!-- 第一步：创建类目 -->
      <div v-if="step === 1" class="edit-from step-one">
        <el-form-item label="上级类目" :label-width="formLabelWidth" prop="techParentLevel">
          <el-cascader v-model="fileDetailForm.techParentLevel"
                       :options="prevLevelOptions"
                       :props="{value: 'id', label: 'name'}"
                       placeholder="请选择上级类目"
                       @change="handleSelectPrevLevel"></el-cascader>
        </el-form-item>
        <el-form-item label="类目名称" :label-width="formLabelWidth" prop="techName">
          <el-input v-model="fileDetailForm.techName" :disabled="fileDetailForm.techParentLevel.length === 0" autocomplete="off" @keyup.native="handleTechNameBlur"></el-input>
        </el-form-item>
        <el-form-item label="类目状态" :label-width="formLabelWidth" prop="techStatus">
          <el-radio-group v-model="fileDetailForm.techStatus" autocomplete="off">
            <el-radio :label="categoryStatusEnum.available">启用</el-radio>
            <el-radio :label="categoryStatusEnum.disable">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="本级位置" :label-width="formLabelWidth">
          <el-button :disabled="fileDetailForm.ids.length === 0" type="text" class="text-right" @click="handleDraggableSort">使用原始排序</el-button>
          <div class="border border-solid border-gray-light p-1 rounded-sm">
            <draggable v-if="fileDetailForm.ids.length > 0" v-model="fileDetailForm.ids" ghost-class="ghost" @change="handleDraggableChange">
              <transition-group type="transition" name="tech-list">
                <div v-for="item in fileDetailForm.ids" :key="item.id" class="draggable-item">
                  {{item.name}}
                  <ej-icon icon="list" class="text-gray"/>
                </div>
              </transition-group>
            </draggable>
            <div v-else style="min-height: 50px;" class="text-center text-gray-dark">
              暂无位置数据
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- 第二步：设置数据 -->
      <div v-else-if="step === 2" class="edit-from step-two">
        <el-form-item label="数据类型" :label-width="formLabelWidth">
          <el-radio-group v-model="fileDetailForm.dataType"
                          autocomplete="off"
                          :disabled="isEditable"
                          @change="handleDataTypeChange">
            <el-radio :label="mdsObjectTypeEnum.database">数据表</el-radio>
            <el-radio :label="mdsObjectTypeEnum.interface">数据接口</el-radio>
            <el-radio :label="mdsObjectTypeEnum.datafile">数据文件</el-radio>
          </el-radio-group>
        </el-form-item>
        <div v-if="dataTypeFlag === mdsObjectTypeEnum.database">
          <el-tabs v-model="sourceActiveName" type="border-card">
            <el-tab-pane label="数据源配置" name="dataSourceTab">
              <div v-if="sourceActiveName === 'dataSourceTab'">
                <el-form-item label="物理区域" :label-width="formLabelWidth">
                  <el-select v-model="fileDetailForm.physicalAreaId" placeholder="请选择物理区域">
                    <el-option v-for="item in physicalList" :key="item.id" :label="item.name" :value="item.id"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="选择数据源" :label-width="formLabelWidth" prop="dataSources">
                  <el-select v-model="fileDetailForm.dataSources" placeholder="请选择数据源" @change="handleDataSourceChange">
                    <el-option v-for="item in dataSourceList" :key="item.id" :label="item.name" :value="item.id"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="数据库名称" :label-width="formLabelWidth" prop="dbName">
                  <el-select v-model="fileDetailForm.dbName" placeholder="请选择数据库名称" @change="handleDbNameChange">
                    <el-option v-for="(item, idx) in dataLibraryList" :key="idx" :label="item" :value="item"/>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="currentDataSource && currentDataSource.isUseSchema" label="Schema" :label-width="formLabelWidth" prop="schema">
                  <el-select v-model="fileDetailForm.schema" placeholder="请选择Schema">
                    <el-option v-for="(item, idx) in schemaList" :key="idx" :label="item" :value="item"/>
                  </el-select>
                </el-form-item>
              </div>
            </el-tab-pane>
            <el-tab-pane label="文件上传" name="fileUploadTab">
              <file-upload v-if="sourceActiveName === 'fileUploadTab'" :formLabelWidth="formLabelWidth" :fileDetailForm="fileDetailForm" :isEditable="isEditable" :mds-type="mdsObjectTypeEnum.database" :db-list="dbList"/>
            </el-tab-pane>
          </el-tabs>
        </div>
        <file-upload v-else :formLabelWidth="formLabelWidth" :fileDetailForm="fileDetailForm" :isEditable="isEditable"/>
      </div>

      <!-- 第三步 （1）：更新策略 -->
      <div v-else-if="step === 3 && dataTypeFlag === mdsObjectTypeEnum.database && sourceActiveName === 'dataSourceTab'" class="edit-from step-three">
        <el-form-item label="调度周期" :label-width="formLabelWidth">
          <el-radio-group v-model="fileDetailForm.cycleType" @change="handleDispatchCycleChange">
            <el-radio :label="scheduledTypeEnum.day">每日</el-radio>
            <el-radio :label="scheduledTypeEnum.week">每周</el-radio>
            <el-radio :label="scheduledTypeEnum.month">每月</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行时间" :label-width="formLabelWidth" prop="timeCycle">
          <day-cycle v-if="fileDetailForm.cycleType === scheduledTypeEnum.month" v-model="fileDetailForm.dayCycle" placeholder="请选择" @change="handleDayCycleChange"/>
          <week-cycle v-if="fileDetailForm.cycleType === scheduledTypeEnum.week" v-model="fileDetailForm.weekCycle" placeholder="请选择" @change="handleWeekCycleChange"/>
          <time-cycle v-model="fileDetailForm.timeCycle" @change="handleTimeCycleChange"/>
        </el-form-item>
        <el-form-item label="技术负责人" :label-width="formLabelWidth" prop="techDirectors">
          <auth-user v-model="fileDetailForm.techDirectors"/>
        </el-form-item>
      </div>

      <!-- 第三步 （2）：信息预览 -->
      <div v-else-if="step === 3" class="edit-from step-three">
        <table class="info-preview">
          <tr>
            <td>文件名称</td>
            <td>导入对的数据平台表</td>
          </tr>
          <tr>
            <td>导入表<small>（张）</small></td>
            <td>{{infoPreview.amount}}</td>
          </tr>
          <tr>
            <td>新增<small>（张）</small></td>
            <td>{{infoPreview.add}}</td>
          </tr>
          <tr>
            <td>删除<small>（张）</small></td>
            <td>{{infoPreview.delete}}</td>
          </tr>
          <tr>
            <td>修改<small>（张）</small></td>
            <td>{{infoPreview.update}}</td>
          </tr>
        </table>
      </div>
    </el-form>

    <!-- 第四步 ：完成 -->
    <div v-if="step === 4" class="edit-from step-fore">
      <h3 v-if="categorySubmitStatus" class="title">
        <img src="@/assets/submit/success.svg" class="mr-4"/>
        <p class="mt-6">设置成功！</p>
      </h3>
      <h3 v-else class="title">
        <img src="@/assets/submit/fail.svg" class="mr-4"/>
        <p class="mt-6">设置失败！</p>
      </h3>
      <p v-if="categorySubmitStatus" class="desc">您所录入的信息已成功提交。</p>
      <p v-else class="desc">如有问题，请联系管理员</p>
      <div class="buttons">
        <el-button plain size="small" @click="handleSubmitContinue">继续提交</el-button>
        <el-button plain size="small" @click="handleSubmitClose">关闭提交</el-button>
      </div>
    </div>

    <template #footer>
      <div class="editor-btns">
        <el-button v-if="step > 1 && step < 4" plain size="small" :disabled="connectTestLoading" @click="handlePrev('fileDetailForm')">上一步</el-button>
        <el-button v-if="step === 2 && dataTypeFlag === mdsObjectTypeEnum.database && sourceActiveName === 'dataSourceTab'" type="primary" size="small" :loading="connectTestLoading" @click="handleConnectTest('fileDetailForm')">连接测试</el-button>
        <el-button v-if="step < 4" type="primary" size="small" :disabled="connectTestLoading" @click="handleNext('fileDetailForm')">{{step === 3 ? '提交' : '下一步' }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  import Vue from 'vue'
  import {
    Button as ElButton,
    Dialog as ElDialog,
    Form as ElForm,
    FormItem as ElFormItem,
    Input as ElInput,
    Select as ElSelect,
    Option as ElOption,
    RadioGroup as ElRadioGroup,
    Radio as ElRadio,
    Cascader as ElCascader,
    Tabs as ElTabs,
    TabPane as ElTabPane,
  } from 'element-ui'
  import Draggable from 'vuedraggable'
  import _ from 'lodash'

  import {Icon} from '@ej/ui'

  import QUERY_PHYSICAL_AREA from '@/graphql/tech_manage_physical_area.gql'
  import QUERY_DBSOURCE_DATABASE_LIST from '@/graphql/dbsource_database_list.gql'
  import QUERY_DBSOURCE_LIST from '@/graphql/dbsource_list.gql'
  import QUERY_DBNAME_LIST from '@/graphql/dbsource_load_dbname_by_sourceid.gql'
  import QUERY_DB_SOURCE_BY_NAME_LIST from '@/graphql/dbsource_detection_db_source_by_name.gql'
  import QUERY_SCHEMA_LIST from '@/graphql/dbsource_load_schema_by_sourceid_bdName.gql'
  import MUTATION_CATEGORY_PREVIEW from '@/graphql/tech_manage_category_preview.gql'
  import MUTATION_TECH_MANAGE_ADD_CATEGORY from '@/graphql/tech_manage_add_tech_category.gql'
  import MUTATION_TECH_MANAGE_UPDATE_CATEGORY from '@/graphql/tech_manage_update_tech_category.gql'
  import TimeCycle from '@/components/time-cycle/time'
  import WeekCycle from '@/components/time-cycle/week'
  import DayCycle from '@/components/time-cycle/day'
  import AuthUser from '@/components/auth-user'
  import StepBar from '@/components/step-bar/step-bar'
  import {GetTreeNode} from '@/utils/tools'
  import Message from '@/utils/message'
  import {formatDate} from '@/utils/date'
  import {wait} from '@/utils/async'
  import {MdsObjectTypeEnum, CategoryTechLevel, ScheduledTypeEnum, CategoryStatusEnum, MdsUpdateTypeEnum} from '@/utils/dictionary'
  import FileUpload from './file-upload'

  Vue.use(Icon)

  export default {
    name: 'EditTechFile',

    components: {
      ElButton,
      ElDialog,
      ElForm,
      ElFormItem,
      ElInput,
      ElSelect,
      ElOption,
      Draggable,
      ElRadioGroup,
      ElRadio,
      ElCascader,
      ElTabs,
      ElTabPane,

      TimeCycle,
      WeekCycle,
      DayCycle,
      AuthUser,
      StepBar,
      FileUpload,
    },

    props: {
      editFileDialogVisible: {
        type: Boolean,
        default: false,
      },
      isEditable: {
        type: Boolean,
        default: false,
      },
      originalData: {
        type: Array,
        default: () => [],
      },
      visible: {
        type: Boolean,
        default: false,
      },
      fileDetail: Object,
    },

    model: {
      prop: 'fileDetail',
      event: 'change',
    },

    data () {
      const errorTip = {
        MAG_PARENT_LEVEL_REQUIRE: '请选择上级类目',
        MAG_TECH_NAME_REQUIRE: '请输入类目名称',
        MAG_TECH_STATUS_REQUIRE: '请选择类目状态',
        MAG_DATA_SOURCE_REQUIRE: '请选择数据源',
        MAG_DB_NAME_REQUIRE: '请选择数据库名称',
        MAG_DATA_SCHEMA_REQUIRE: '请选择Schema名称',
        MAG_UPLOAD_TYPE_REQUIRE: '请选择上传方式',
        MAG_DB_TYPE_REQUIRE: '请选择数据库类型',
        MAG_TIME_CYCLE_REQUIRE: '请选择执行时间',
        MAG_UPLOAD_FILE_REQUIRE: '请选择上传的文件',
        MAG_TECH_DIRECTORS_REQUIRE: '请选择技术负责人',
      }

      return {
        step: 1,
        formLabelWidth: '100px',
        rules: {
          techParentLevel: [{required: true, message: errorTip.MAG_PARENT_LEVEL_REQUIRE, trigger: 'change'}],
          techName: [{required: true, message: errorTip.MAG_TECH_NAME_REQUIRE, trigger: 'blur'}],
          techStatus: [{required: true, message: errorTip.MAG_TECH_STATUS_REQUIRE, trigger: 'change'}],
          dataSources: [{required: true, message: errorTip.MAG_DATA_SOURCE_REQUIRE, trigger: 'change'}],
          dbName: [{required: true, message: errorTip.MAG_DB_NAME_REQUIRE, trigger: 'change'}],
          schema: [{required: true, message: errorTip.MAG_DATA_SCHEMA_REQUIRE, trigger: 'change'}],
          uploadType: [{required: true, message: errorTip.MAG_UPLOAD_TYPE_REQUIRE, trigger: 'change'}],
          dbType: [{required: true, message: errorTip.MAG_DB_TYPE_REQUIRE, trigger: 'change'}],
          uploadFile: [{required: true, message: errorTip.MAG_UPLOAD_FILE_REQUIRE, trigger: 'change'}],
          timeCycle: [{required: true, message: errorTip.MAG_TIME_CYCLE_REQUIRE, trigger: 'change'}],
          techDirectors: [{required: true, message: errorTip.MAG_TECH_DIRECTORS_REQUIRE, trigger: 'change'}],
        },

        // 数据设置-物理区域列表
        physicalList: [],

        // 数据设置-数据源列表
        dataSourceList: [],

        // 数据设置-当前选中的数据源，为了使用其中的isUseSchema属性
        currentDataSource: null,

        // 数据设置-数据库列表
        dataLibraryList: [],

        // 数据设置-schema列表
        schemaList: [],

        // 数据预览
        infoPreview: {
          amount: 0,
          add: 0,
          delete: 0,
          update: 0,
        },

        // 提交类目成功和失败，默认成功，用于`step=4`时页面展示
        categorySubmitStatus: true,

        // 连接测试loading
        connectTestLoading: false,

        // 数据源中-tab选项
        sourceActiveName: 'dataSourceTab',
      }
    },

    computed: {
      mdsUpdateTypeEnum: () => MdsUpdateTypeEnum,

      mdsObjectTypeEnum: () => MdsObjectTypeEnum,

      categoryStatusEnum: () => CategoryStatusEnum,

      scheduledTypeEnum: () => ScheduledTypeEnum,

      techData () {
        return _.cloneDeep(this.originalData).filter(t => t)
      },

      fileDetailForm: {
        get () {
          return this.fileDetail
        },

        set (val) {
          this.$emit('change', val)
        },
      },

      // 对话框标题
      dialogTitle () {
        return this.isEditable ? '编辑类目' : '新增类目'
      },

      // 上级类目数据
      prevLevelOptions () {
        // 过滤掉 `DATABASE level=2`数据，第三层数据不参与选则
        let techList = this.techData.filter(od => od.level !== CategoryTechLevel.database)

        // 生成tree数据
        const techLevelData = GetTreeNode(_.cloneDeep(techList).filter(t => t))

        // 如果数据只有`SYSTEM level=0`，没有子节点，则不可让用户选则
        techLevelData.map(tl => {
          if (tl.level === CategoryTechLevel.system && tl.children) {
            tl.disabled = false
          } else {
            tl.disabled = true
          }
          return tl
        })

        return techLevelData || []
      },

      isVisible: {
        get () {
          return this.visible
        },
        set (val) {
          this.$emit('change', val)
        },
      },

      /**
       * 数据类型
       * `数据表` 、`数据文件`分别显示不同视图
       */
      dataTypeFlag () {
        return this.fileDetailForm.dataType || this.mdsObjectTypeEnum.database
      },
    },

    apollo: {
      dbList: {
        query: QUERY_DBSOURCE_DATABASE_LIST,
        fetchPolicy: 'no-cache',
        update: data => data.dbSourceType,
      },
    },

    created () {
      this.getDbsourceList()
      this.getPhysicalData()
      // this.dataSourceList = MOCK_DATA_BASE_LIST()
      // this.dataLibraryList = MOCK_DATA_LIBRARY_LIST()
    },

    methods: {
      /**
       * 获取数据源列表
       */
      async getDbsourceList () {
        const {data: {dbsources}} = await this.$apollo.query({
          query: QUERY_DBSOURCE_LIST,
          variables: {
            input: {
              keyword: '',
              size: 10000,
              offset: 0,
            },
          },
        })

        if (dbsources && dbsources.data) {
          // 加map遍历-测试
          this.dataSourceList = dbsources.data

          this.dataSourceList.map(dd => {
            if (dd.type === 'MYSQL') {
              dd.type = 'POSTGRESQL'
            }

            return dd
          })
        }
      },

      /**
       * 物理区域列表
       */
      async getPhysicalData () {
        const {data: {loadPhysicalArea}} = await this.$apollo.query({
          query: QUERY_PHYSICAL_AREA,
        })

        if (loadPhysicalArea) {
          this.physicalList = loadPhysicalArea
        }
      },

      /**
       * 通过dbsourceId获取所有的数据库名
       * @param {String} [dbsourceId] 数据源ID
       */
      async getDbnameList (dbsourceId) {
        const {data: {dbname}} = await this.$apollo.query({
          query: QUERY_DBNAME_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            dbSourceId: dbsourceId,
          },
        })

        if (dbname) {
          this.dataLibraryList = dbname
        }
      },

      /**
       * 通过dbsourceId获取所有的数据库名
       * @param {String} [dbsourceId] 数据源ID
       * @param {String} [dbName] 数据库名
       */
      async getSchemaList (dbsourceId, dbName) {
        const {data: {schemaList}} = await this.$apollo.query({
          query: QUERY_SCHEMA_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            dbSourceId: dbsourceId,
            dbName: dbName,
          },
        })

        if (schemaList) {
          this.schemaList = schemaList
        }
      },

      handleClose () {
        this.$emit('close-dialog', false)
        this.resetForm()
        this.resetStep()
      },

      /**
       * 点击`恢复原来的排序`触发
       */
      handleDraggableSort () {
        this.commonSort()
      },

      /**
       * 创建类目：拖拽时触发
       */
      handleDraggableChange (val) {
        console.log('draggable', val, this.fileDetailForm.ids)
      },

      /**
       * 选中`上级类目`时触发
       */
      handleSelectPrevLevel (catalogList) {
        this.commonSort()
      },

      /**
       * `类目名称`失去焦点时触发，将`类目名称`添加到`本级位置`列表中
       */
      handleTechNameBlur (val) {
        let filterId = this.isEditable ? this.fileDetailForm.id : -1
        this.fileDetailForm.ids = this.fileDetailForm.ids.filter(eo => eo.id !== filterId)
        if (this.fileDetailForm.techName) {
          this.fileDetailForm.ids.unshift({
            id: filterId,
            name: this.fileDetailForm.techName,
          })
        }
      },

      /**
       * 排序
       */
      commonSort () {
        let _techParentLevel = this.fileDetailForm.techParentLevel
        const prevCatalogId = Array.isArray(_techParentLevel) && _techParentLevel.length > 0 ? _techParentLevel[_techParentLevel.length - 1] : _techParentLevel
        const databaseData = this.techData.filter(od => od.parentId === prevCatalogId)
        let _ids = null
        if (!this.isEditable) {
          _ids = this.fileDetailForm.ids.find(eo => eo.id === -1)
        } else {
          //  _ids = this.fileDetailForm.ids.find(eo => eo.id === this.fileDetailForm.id)
        }
        this.fileDetailForm.ids = _ids ? [_ids, ...databaseData] : databaseData
      },

      /**
       * 点击`下一步`按钮
       */
      handleNext (formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            if (this.step === 1) {
              this.step++
            } else if (this.step === 2) {
              if (this.fileDetailForm.dataType === this.mdsObjectTypeEnum.interface ||
                this.fileDetailForm.dataType === this.mdsObjectTypeEnum.datafile ||
                (this.fileDetailForm.dataType === this.mdsObjectTypeEnum.database && this.sourceActiveName === 'fileUploadTab')) {
                // 信息预览
                await this.sendRequestInfoPreview()
              }
              this.step++
            } else if (this.step === 3) {
              if (this.isEditable) {
                // 修改
                await this.sendRequestUpdateCategory()
              } else {
                // 新增
                await this.sendRequestAddCategory()
              }
              this.step++
            }
          } else {
            return false
          }
        })
      },

      /**
       * 增加类目请求
       */
      async sendRequestAddCategory () {
        const {data: {addTechCategory}} = await this.$apollo.mutate({
          mutation: MUTATION_TECH_MANAGE_ADD_CATEGORY,
          variables: {
            input: {...this.paramsFormat()},
          },
        })

        if (addTechCategory) {
          Message.MessageSuccess({messageSuccessText: '操作成功'})
          this.categorySubmitStatus = true
        } else {
          Message.MessageError({messageErrorText: '操作失败'})
          this.categorySubmitStatus = false
        }
      },

      /**
       * 修改类目请求
       */
      async sendRequestUpdateCategory () {
        const {data: {updateTechCategory}} = await this.$apollo.mutate({
          mutation: MUTATION_TECH_MANAGE_UPDATE_CATEGORY,
          variables: {
            input: {...this.paramsFormat()},
          },
        })

        if (updateTechCategory) {
          Message.MessageSuccess({messageSuccessText: '操作成功'})
          this.categorySubmitStatus = true
        } else {
          Message.MessageError({messageErrorText: '操作失败'})
          this.categorySubmitStatus = false
        }
      },

      /**
       * 信息预览请求
       */
      async sendRequestInfoPreview () {
        const {data: {categoryPreview}} = await this.$apollo.mutate({
          mutation: MUTATION_CATEGORY_PREVIEW,
          variables: {
            input: {...this.paramsFormat()},
          },
        })

        if (categoryPreview && categoryPreview.importJobId) {
          this.fileDetailForm.importJobId = categoryPreview.importJobId

          this.infoPreview = {
            amount: categoryPreview.amount,
            add: categoryPreview.add,
            delete: categoryPreview.delete,
            update: categoryPreview.update,
          }
        }
      },

      /**
       * 提交参数格式化
       */
      paramsFormat () {
        let _parentId = this.fileDetailForm.techParentLevel
        _parentId = Array.isArray(_parentId) ? _parentId[_parentId.length - 1] : _parentId

        return {
          id: this.fileDetailForm.id,
          parentId: _parentId,
          name: this.fileDetailForm.techName,
          ids: this.fileDetailForm.ids.map(o => o.id),
          status: this.fileDetailForm.techStatus,

          sourceType: this.fileDetailForm.dataType,
          updateType: this.fileDetailForm.uploadType,
          dbType: this.fileDetailForm.dbType,
          updateFile: this.fileDetailForm.uploadFile,
          importJobId: this.fileDetailForm.importJobId,

          physicalAreaId: this.fileDetailForm.physicalAreaId,
          dbSourceId: this.fileDetailForm.dataSources,
          dbName: this.fileDetailForm.dbName,
          schema: this.fileDetailForm.schema,

          scheduledType: this.fileDetailForm.cycleType,
          scheduledTime: this.fileDetailForm.timeCycle ? formatDate(new Date(this.fileDetailForm.timeCycle), 'HH:mm:ss') : null,
          scheduledWeek: this.fileDetailForm.weekCycle,
          scheduledDay: this.fileDetailForm.dayCycle,
          techManIds: this.fileDetailForm.techDirectors,
        }
      },

      /**
       * 点击`上一步`按钮
       */
      handlePrev () {
        this.step--
      },

      /**
       * 连接测试
       */
      handleConnectTest (formName) {
        this.connectTestLoading = true
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            await wait(600)

            const {data: {detectionDbSourceByName}} = await this.$apollo.query({
              query: QUERY_DB_SOURCE_BY_NAME_LIST,
              fetchPolicy: 'no-cache',
              variables: {
                dbSourceId: this.fileDetailForm.dataSources,
                dbName: this.fileDetailForm.dbName,
                schema: this.fileDetailForm.schema,
              },
            })
            this.connectTestLoading = false
            if (detectionDbSourceByName) {
              Message.MessageSuccess({messageSuccessText: '连接成功'})
            } else {
              Message.MessageError({messageErrorText: '连接失败'})
            }
          } else {
            return false
          }
        })
      },

      /**
       * 切换`数据类型`时触发
       */
      handleDataTypeChange (val) {
        if (val === this.mdsObjectTypeEnum.database) { // 数据类型 为`数据表`，则将`上传方式`/`上传文件`置空
          this.fileDetailForm.uploadType = null
          this.fileDetailForm.dbType = ''
          this.fileDetailForm.uploadFile = ''
        } else { // 数据类型 为`数据接口` or `数据文件`，则将`选择数据源`/`数据库名称`置空
          this.fileDetailForm.dataSources = ''
          this.fileDetailForm.dbName = ''
          this.fileDetailForm.schema = ''
          this.fileDetailForm.weekCycle = null
          this.fileDetailForm.dayCycle = null
          this.fileDetailForm.timeCycle = ''
          this.fileDetailForm.cycleType = this.scheduledTypeEnum.day
          this.fileDetailForm.techDirectors = []
        }
        this.$refs.fileDetailForm.clearValidate()
      },

      /**
       * 切换`数据类型`下拉列表时触发
       */
      async handleDataSourceChange (dbsourceId) {
        // 缓存当前的dbSource
        this.currentDataSource = this.dataSourceList.find(d => d.id === dbsourceId)

        // 数据库名
        this.fileDetailForm.dbName = ''

        if (this.currentDataSource.isUseSchema) {
          // schema
          this.schemaList = []
          this.fileDetailForm.schema = ''
        }

        // 获取数据库名接口
        await this.getDbnameList(dbsourceId)
      },

      /**
       * 切换`数据库名`下拉列表时触发
       */
      async handleDbNameChange (dbName) {
        this.fileDetailForm.schema = ''

        if (this.currentDataSource.isUseSchema) {
          // 获取schema接口
          await this.getSchemaList(this.fileDetailForm.dataSources, dbName)
        }
      },

      /**
       * 切换`调度周期`单选时触发
       */
      handleDispatchCycleChange (val) {
        console.log('val', val)
      },

      /**
       * `调度周期` 选择 `日` 触发
       */
      handleTimeCycleChange (val) {
        console.log('调度周期, 选择 `日` 触发', formatDate(new Date(val), 'HH:mm:ss'))
      },

      /**
       * `调度周期` 选择 `周` 触发
       */
      handleWeekCycleChange (val) {
        console.log('周val', val)
      },

      /**
       * `调度周期` 选择 `月` 触发
       */
      handleDayCycleChange (val) {
        console.log('月val', val)
      },

      /**
       * 选择`技术负责人`时触发
       */
      handleCheckNode (selectTech) {
        this.fileDetailForm.techDirectors = selectTech.map(s => s.id)
      },

      /**
       * 点击`关闭提交`时触发
       */
      handleSubmitClose () {
        this.$emit('submit-close', this.isEditable ? this.fileDetailForm.id : this.fileDetailForm.parentId)
        this.resetForm()
        this.resetStep()
      },

      /**
       * 点击`继续提交`时触发
       */
      handleSubmitContinue () {
        this.resetForm()
        this.resetStep()
      },

      /**
       * 重置step
       */
      resetStep () {
        this.step = 1
      },

      /**
       * 重置Form
       */
      resetForm () {
        this.$emit('reset-form')
      },
    },
  }
</script>

<style lang="scss">
  .edit-tech-file-view {
    width: 900px;
    .editor-btns {
      .el-button--primary {
        @apply text-white bg-blue border-blue;
      }
    }

    .step-fore {
      .el-icon-check {
        @apply inline-block border-2 border-solid border-green-light rounded-full p-1 text-green font-semibold text-xl mr-4;
      }
      .title {
        @apply font-semibold text-xl text-gray-darkest text-center my-10;

        margin: 50px 0;
      }
      .desc {
        @apply text-center;
      }
      .buttons {
        @apply text-center mt-10;
      }
    }

    .edit-from {
      width: 400px;
      margin: 30px auto 0;
      .info-preview {
        @apply border-2 border-solid border-gray-lighter rounded-lg w-full;
        tr,td {
          @apply border border-solid border-gray-lighter;
        }
        tr {
          height: 40px;
          line-height: 40px;
        }
        td {
          @apply pl-4 text-center;

          &:first-of-type {
            @apply font-semibold w-1/3 text-left;
          }

          small {
            @apply font-normal;
          }
        }
      }

      .upload-wrap {
        .el-button {
          @apply bg-white border-gray text-base text-gray-dark;
        }
      }

      .el-cascader {
        width: 100%;
      }

      .el-form-item__label {
        @apply text-gray-darkest text-base font-semibold;
      }

      .el-input__inner {
        height: 30px;
        line-height: 30px;
      }
      .tech-list-move {
        transition: transform 0.5s;
      }

      .draggable-item {
        @apply cursor-move rounded-sm pl-3 pr-5;

        height: 30px;
        line-height: 30px;

        &:hover {
          @apply bg-blue-lighter;
        }

        .ej-icon {
          @apply float-right;

          margin-top: 6px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .el-dialog__body {
      padding: 10px 20px;
      min-height: 400px;
      .el-form-item {
        margin-bottom: 18px;
      }
    }
  }
</style>
