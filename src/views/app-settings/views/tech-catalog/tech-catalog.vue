<template>
  <div class="tech-catalog-view">
    <settings-layout layout="GENERAL"
                     search-input-width="440"
                     @search="handleSearch">
      <template #buttonArea>
        <el-popover placement="bottom" trigger="hover" v-model="downloadButtonVisible" popper-class="tech-create-btns" class="ml-3">
          <ul class="create-btns">
            <li v-for="(item, idx) in modelDownList" :key="idx">
              <div title="点击下载模板" class="create-btn" @click="handleDownload(item.url)">{{item.name}}
                <ej-icon icon="import" class="btn-import ml-4"/>
              </div>
            </li>
          </ul>
          <el-button slot="reference" type="primary" plain :class="{btnActive: downloadButtonVisible}">模板下载</el-button>
        </el-popover>

        <el-popover placement="bottom" trigger="hover" v-model="addButtonVisible" popper-class="tech-create-btns" class="ml-3">
          <ul class="create-btns">
            <li>
              <div class="create-btn" @click="addButtonVisible = false, editFloderDialogVisible = true, isEditable = false">
              <i class="el-icon-folder mr-4"></i>新增分类</div>
            </li>
            <li>
              <div class="create-btn" @click="addButtonVisible = false, editFileDialogVisible = true, isEditable = false">
              <i class="el-icon-tickets mr-4"></i>新增类目</div>
            </li>
          </ul>
          <el-button slot="reference" type="primary" plain :class="{btnActive: addButtonVisible}">新增</el-button>
        </el-popover>
      </template>

      <template #mainArea>
        <el-table v-ej-loading="isLoading"
                  ref="treeTable"
                  :data="techDataFilterList"
                  :row-key="getRowKeys"
                  :expand-row-keys="expands"
                  :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                  style="width: 100%;margin-bottom: 20px;"
                  @row-click="row => handleJumpSchedule(row)">
          <el-table-column prop="category.name" label="目录名称" width="200"/>
          <el-table-column prop="dbSource.address" label="数据源地址"/>
          <el-table-column prop="schedule.scheduledType" label="调度周期"/>
          <el-table-column prop="schedule.scheduledTime" label="执行时间"/>
          <el-table-column prop="schedule.lastRunTm" label="最后更新日期" width="160">
            <template #default="{row}">
              {{handleFormatDate(row.schedule ? row.schedule.lastRunTm : null)}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="230" fixed="right">
            <template #default="{row}">
              <el-button type="text" @click="handleEditor(row)" @click.native.stop>编辑</el-button>
              <el-button type="text" @click="handleTechRemove(row)" @click.native.stop>删除</el-button>
              <el-button v-if="row.category.techLevelType === 'DATABASE'" type="text" @click="handleOperaSchedule(row)" @click.native.stop>执行调度</el-button>
              <span v-else class="ml-8 text-gray-dark">--</span>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </settings-layout>

    <!-- 编辑 or 新增 类目 -->
    <edit-dialog-file :visible="editFileDialogVisible"
                      v-model="fileDetail"
                      :isEditable="isEditable"
                      :original-data="techOriginal"
                      @close-dialog="closeFileDialog"
                      @submit-close="handleFileSubmitClose"
                      @reset-form="handleReset('file')"/>

    <!-- 编辑 or 新增 分类 -->
    <edit-dialog-floder :visible="editFloderDialogVisible"
                        v-model="floderDetail"
                        :isEditable="isEditable"
                        :original-data="techOriginal"
                        @close-dialog="closeFloderDialog"
                        @submit-close="handleFloderSubmitClose"
                        @reset-form="handleReset('floder')"/>

  </div>
</template>

<script>
  import Vue from 'vue'
  import {mapGetters} from 'vuex'
  import _ from 'lodash'
  import {
    Button as ElButton,
    Table as ElTable,
    TableColumn as ElTableColumn,
    Popover as ElPopover,
  } from 'element-ui'

  import {Icon, Loading} from '@ej/ui'

  import runtimeArgs from '@/runtime-args'
  import QUERY_TECH_CATEGORY_LIST from '@/graphql/tech_manage_tech_category_list.gql'
  import QUERY_TECH_REMOVE_EFFECT from '@/graphql/tech_manage_remove_category_effect.gql'
  import QUERY_TEMPLATE_FILE_DOWNLOAD from '@/graphql/tech_manage_template_file_download.gql'
  import MUTATION_TECH_REMOVE from '@/graphql/tech_manage_remove_category.gql'
  import MUTATION_OPERA_SCHEDULE from '@/graphql/tech_manage_opera_schedule.gql'
  import SettingsLayout from '@/components/settings-layout'
  import EditDialogFile from './edit-dialog-file'
  import EditDialogFloder from './edit-dialog-floder'
  import {GetTreeNode, GetFirstNode, GetTreeRoutemsg} from '@/utils/tools'
  import {formatDate} from '@/utils/date'
  import Message from '@/utils/message'
  import {MdsObjectTypeEnum, CategoryTechLevel} from '@/utils/dictionary'
  import {wait} from '@/utils/async'

  Vue.use(Icon)
  Vue.use(Loading)

  const FILE_DOWNLOAD_ADDRESS = runtimeArgs.VUE_APP_DOWNLOAD_HTTP

  export default {
    name: 'TechCatalogView',

    components: {
      ElButton,
      ElTable,
      ElTableColumn,
      ElPopover,

      SettingsLayout,
      EditDialogFile,
      EditDialogFloder,
    },

    data () {
      let emptyFileForm = {
        id: '',
        techParentLevel: [],
        techName: '',
        techStatus: null,
        ids: [],

        physicalAreaId: '',
        dataType: 'TABLE',
        dataSources: '',
        dbName: '',
        schema: '',
        uploadType: null,
        dbType: '',
        uploadFile: '',

        importJobId: '',
        timeCycle: '',
        weekCycle: null,
        dayCycle: null,
        cycleType: 'DAY',
        techDirectors: [],
      }

      let emptyFloderForm = {
        id: '',
        parentId: 0,
        name: '',
        ids: [],
      }

      return {
        // 技术类目数据：原始平级数据
        techOriginalList: [],

        // 技术类目数据：tree数据(所有数据)
        techDataTreeList: [],

        // 技术类目数据：tree数据
        techDataFilterList: [],

        // 要展开的行，数值的元素是row的key值
        expands: [],

        // 新增按钮: hover时 popover 是否显示
        addButtonVisible: false,

        // 新增按钮: hover时 popover 是否显示
        downloadButtonVisible: false,

        // 编辑-类目-对话框： 显示状态
        editFileDialogVisible: false,

        // 编辑-分类-对话框： 显示状态
        editFloderDialogVisible: false,

        // `编辑` or `新增`： 显示状态
        isEditable: false,

        // `编辑类目`表单对象
        fileDetail: {...emptyFileForm},

        defaultFileForm: {...emptyFileForm},

        // `编辑分类`表单对象
        floderDetail: {...emptyFloderForm},

        defaultFloderForm: {...emptyFloderForm},

        // 模板下载列表
        modelDownList: [],

        // 列表加载状态
        isLoading: false,
      }
    },

    computed: {
      ...mapGetters({
        techOriginal: 'techOriginal',
      }),
    },

    async created () {
      await this.sendRequestTechData()
      await this.getExpendFirstNode()
      await this.getTemplateFileList()
    },

    methods: {
      handleFormatDate (val) {
        if (!val) return '--'
        return formatDate(new Date(val))
      },
      /**
       * 发送请求类目数据
       */
      async sendRequestTechData () {
        this.isLoading = true
        const {data: {techDataList}} = await this.$apollo.query({
          query: QUERY_TECH_CATEGORY_LIST,
          fetchPolicy: 'no-cache',
        })
        this.isLoading = false
        if (techDataList) {
          this.techOriginalList = techDataList
          let copyObj = _.cloneDeep(techDataList).filter(od => od)
          this.techDataFilterList = this.techDataTreeList = GetTreeNode(copyObj)
        }
      },

      /**
       * 点击行跳转调度信息页面
       */
      handleJumpSchedule (row) {
        // 除了`数据表`数据类型，其他的类型不能进入详情页
        if (row.category.mdsType !== MdsObjectTypeEnum.database) return

        if (row.category.level === CategoryTechLevel.database) {
          this.$router.push({name: 'tech-schedule', params: {categoryId: row.id}})
        }
      },

      /**
       * 获取row的key值
       */
      getRowKeys (row) {
        return row.id
      },

      /**
       * 默认展开第一项
       */
      getExpendFirstNode () {
        const {nodes} = GetFirstNode(this.techDataFilterList)
        this.expands = []
        nodes.map(n => {
          this.expands.push(n.id)
        })
      },

      /**
       * 过滤tree数据
       * @param {*} keyword 搜索关键词
       */
      handleSearch (keyword) {
        if (!keyword) {
          this.getExpendFirstNode()
          this.keyword = ''
          this.techDataFilterList = [...this.techDataTreeList]
          return
        }

        let _filterOriginalList = this.techOriginalList.filter(tf => {
          if (tf.category.name.includes(keyword) || tf.category.name.toLowerCase().includes(keyword.toLowerCase())) {
            return tf
          }
        })

        /**
         * 获取路径
         * @param {Array} menuData 原生数据
         * @param {Number} clickId 点击id
         */
        let _hasRouteIds = []
        let _hasRouteObjs = []

        function getGetTreeRoutemsg (menuData, clickId) {
          if (_hasRouteIds.includes(clickId)) {
            return
          }
          _hasRouteIds.push(clickId)

          let routes = []
          const each = (recuData, sourceData) => {
            sourceData.map(sd => sd.id === recuData.parentId && (each(sd, sourceData), routes.push(sd)))
          }
          const currentdata = menuData.find(node => node.id === clickId)
          if (currentdata) {
            each(currentdata, menuData)
          }
          // 加入当前节点
          routes.push(currentdata)
          return routes
        }

        _filterOriginalList.map(f => {
          let _routerArr = getGetTreeRoutemsg(_.cloneDeep(this.techOriginalList).filter(t => t), f.id)
          // 剔除重复数据
          let _hasRouteObjsFilter = _hasRouteObjs.filter(h => {
            const _rObj = _routerArr.find(r => r.id === h.id)
            if (!_rObj) {
              return h
            }
          })
          _hasRouteObjs = [..._routerArr, ..._hasRouteObjsFilter]
        })

        this.techDataFilterList = [...GetTreeNode(_hasRouteObjs)]
        // 默认展开当前搜索到的数据
        this.expands = [..._hasRouteObjs.map(f => f.id)]
      },

      async closeFileDialog (visible) {
        this.editFileDialogVisible = visible

        // 关闭对话框时 刷新技术类目数据 目的：如果用户填完之后 选择`继续提交` 然后未录入完 就关闭，这种情况页面要出现新添加的数据
        await this.$store.dispatch('categoriesTechList')
      },

      closeFloderDialog (visible) {
        this.editFloderDialogVisible = visible
      },

      /**
       * 编辑类目 提交成功 且 点击`关闭提交`时 执行
       * @param {Number} [showId] 展开的节点 新增展开其父节点，修改展开当前节点
       */
      async handleFileSubmitClose (showId) {
        this.editFileDialogVisible = false
        this.refreshData(showId)
      },

      /**
       * 编辑分类 提交成功 时 执行
       * @param {Number} [showId] 展开的节点 新增展开其父节点，修改展开当前节点
       */
      handleFloderSubmitClose (showId) {
        this.editFloderDialogVisible = false
        this.refreshData(showId)
      },

      /**
       * 提交之后-刷新数据
       * @param {Number} [showId] 展开的节点 新增展开其父节点，修改展开当前节点
       */
      async refreshData (showId) {
        await wait(800)

        await this.sendRequestTechData()
        await this.$store.dispatch('categoriesTechList')

        showId = Array.isArray(showId) && showId.length > 0 ? showId[0] : 0

        if (showId) {
          let currentPath = GetTreeRoutemsg(_.cloneDeep(this.techOriginalList).filter(t => t), showId)
          this.expands = (currentPath || []).map(c => c.id)
        }
      },

      /**
       * 点击`编辑`按钮时执行
       */
      handleEditor (row) {
        if (row.category.level === CategoryTechLevel.database) {
          this.fileDetail = {
            id: row.id,
            techParentLevel: row.parentId,
            techName: row.category.name,
            techStatus: row.category.status,
            ids: this.techOriginal.filter(t => t.parentId === row.parentId),

            physicalAreaId: row.category.physicalArea ? row.category.physicalArea.id : '',
            dataType: row.category.mdsType,
            dataSources: row.dbSource ? row.dbSource.id : '',
            dbName: row.schedule ? row.schedule.dbName : '',
            uploadType: null,
            dbType: row.dbType,
            uploadFile: '',

            timeCycle: row.schedule && row.schedule.scheduledTime ? this.timeFormat(row.schedule.scheduledTime) : '',
            weekCycle: row.schedule ? row.schedule.scheduledWeek : null,
            dayCycle: row.schedule ? row.schedule.scheduledDay : null,
            cycleType: row.schedule ? row.schedule.scheduledType : null,
            techDirectors: row.schedule ? row.schedule.techMans.map(u => u.id) : [],
          }
          this.editFileDialogVisible = true
        } else {
          this.floderDetail = {
            id: row.id,
            parentId: row.parentId,
            name: row.category.name,
            ids: this.techOriginal.filter(t => t.parentId === row.parentId),
          }
          this.editFloderDialogVisible = true
        }
        this.isEditable = true
      },

      /**
       * 重置Form表单对象
       */
      handleReset (type) {
        if (type === 'floder') {
          this.floderDetail = {...this.defaultFloderForm}
        } else if (type === 'file') {
          this.fileDetail = {...this.defaultFileForm}
        }
      },

      /**
       * 移除技术类目
       */
      async handleTechRemove (row) {
        let _msg = ''
        let {data: {removeCategoryEffect}} = await this.$apollo.query({
          query: QUERY_TECH_REMOVE_EFFECT,
          fetchPolicy: 'no-cache',
          variables: {
            techCateId: row.category.id,
          },
        })

        if (removeCategoryEffect && removeCategoryEffect.length > 0) {
          let _category = removeCategoryEffect.length > 3 ? removeCategoryEffect.splice(0, 3) : removeCategoryEffect
          _msg = `删除【${row.category.name}】将会影响${_category.join('、')}..., 是否继续?`
        } else {
          _msg = `此次操作将删除【${row.category.name}】, 是否继续?`
        }

        Message.MessageBoxConfirm(
          {
            message: _msg,
            messageSuccessText: '操作成功',
            messageErrorText: '已取消操作',
          },
          async () => {
            // 删除节点
            await this.$apollo.mutate({
              mutation: MUTATION_TECH_REMOVE,
              variables: {
                techCateId: row.category.id,
              },
            }).then(({data: {removeTechCategory}}) => {
              if (removeTechCategory) {
                // 刷新数据
                let _timer = setTimeout(async () => {
                  await this.sendRequestTechData()
                  await this.$store.dispatch('categoriesTechList')
                  clearTimeout(_timer)
                })
              } else {
                throw new Error({message: '操作失败', isShow: true})
              }
            }).catch(() => {
              throw new Error({message: '操作失败', isShow: true})
            })
          })
      },

      /**
       * 模板列表
       */
      async getTemplateFileList () {
        const {data: {templateFile}} = await this.$apollo.query({
          query: QUERY_TEMPLATE_FILE_DOWNLOAD,
        })
        this.modelDownList = templateFile
      },

      /**
       * 下载模板
       */
      handleDownload (ambryId) {
        let _downloadAddress = `${FILE_DOWNLOAD_ADDRESS}?ambryId=${ambryId}`
        if (_downloadAddress) {
          const downloadElement = document.createElement('a')
          downloadElement.href = _downloadAddress
          downloadElement.download = _downloadAddress
          document.body.appendChild(downloadElement)
          downloadElement.click()
          document.body.removeChild(downloadElement)
          window.URL.revokeObjectURL(_downloadAddress)
        }
      },

      /**
       * 执行调度
       */
      async handleOperaSchedule (row) {
        if (!row.schedule || !row.schedule.id) {
          Message.MessageError({messageErrorText: '调度ID不能为空'})
          return
        }
        const {data: {operaSchedule}} = await this.$apollo.mutate({
          mutation: MUTATION_OPERA_SCHEDULE,
          variables: {
            mdsScheduleId: row.schedule.id,
          },
        })

        if (operaSchedule) {
          Message.MessageSuccess({messageSuccessText: '操作成功'})
        } else {
          Message.MessageError({messageErrorText: '操作失败'})
        }
      },

      /**
       * 时分秒字符串格式化
       */
      timeFormat (str = '00:00:00') {
        let nowDate = new Date()
        const _timeArr = str.split(':')
        nowDate.setHours(_timeArr[0] || '00')
        nowDate.setMinutes(_timeArr[1] || '00')
        nowDate.setSeconds(_timeArr[2] || '00')
        return nowDate.getTime()
      },
    },
  }
</script>

<style lang="scss">
  .tech-create-btns {
    padding: 0;
    .btn-import {
      width: 14px;
      height: 14px;
      margin-top: -3px;
    }
    .create-btns {
      @apply pt-1;
      li {
        @apply border-b border-solid border-gray-lighter cursor-pointer;

        transition: .2s;
        .create-btn {
          @apply px-6 py-3;
        }
        &:hover {
          @apply bg-blue-light text-white;
        }
      }
    }
  }
  .tech-catalog-view {
    @apply bg-white p-6;
  }
</style>
