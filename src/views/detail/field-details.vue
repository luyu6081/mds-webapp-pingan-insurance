<template>
  <div class="field-view" v-ej-loading="$apollo.queries.dataFieldDetails.loading">
    <header v-if="dataFieldDetails" class="flex justify">
      <span class="flex-item solid field-header-count">共 {{dataFieldDetails.fieldDetail.length}} 个字段</span>
      <div v-if="isAccessibility" class="field-header-buttons flex-item solid">
        <el-button icon="el-icon-check" size="mini" @click="handleSubmitbility">提交</el-button>
        <el-button icon="el-icon-close" size="mini" @click="isAccessibility = false">取消</el-button>
      </div>
      <div v-else class="field-header-buttons flex-item solid">
        <el-button size="mini" @click="handleAccessibility">申请权限</el-button>
        <el-button size="mini" @click="isDDLDlgVisible = true">生成 DDL 语句</el-button>
        <el-button size="mini" @click="downloadFieldData">下载字段信息</el-button>
        <el-button size="mini" @click="handleSampleData">数据预览</el-button>
      </div>
    </header>
    <div class="field-content" v-if="dataFieldDetails">
      <common-table ref="fieldTable"
                    tooltip-effect="dark"
                     style="width: 100%;"
                    :data="dataFieldDetails.fieldDetail"
                    @selection-change="handleSelectionChange">
        <el-table-column v-if="isAccessibility" key="1" prop="id" type="selection" width="50" />
        <el-table-column v-else type=index label="序号" width="50"/>
        <el-table-column prop="name" label="字段名称"/>
        <el-table-column prop="type" label="字段类型"/>
        <el-table-column prop="desc" label="字段描述"/>
        <el-table-column prop="fieldApplyList" label="是否已申请权限">
          <template #default="scope">
            <span v-if="fieldOriginalApplyList.includes(scope.row.id)">是</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column prop="propertyLevel" label="资产等级" width="100"/>
        <el-table-column prop="securityLevel" label="安全等级" width="100"/>
        <el-table-column prop="browseNum" label="访问热度" width="100">
          <template #default="scope">
            <div>
              <ej-icon :icon="heatLevel(scope.row.browseNum)" class="common-icon signal-level"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="columnFeature" label="主/外键" width="100"/>
        <el-table-column label="操作" width="50">
          <template #default="scope">
            <el-button type="text"
                       class="field-detail-btn"
                       @click="handleFieldDetail(scope.row.id)">详情</el-button>
          </template>
        </el-table-column>
      </common-table>
    </div>

    <el-dialog title="生成DDL语句"
               :visible.sync="isDDLDlgVisible"
               append-to-body
               class="field-detail-dialog">
      <div class="field-ddl">
        <ej-highlight :code="toJSON(generateDDL) || '暂无DDL语句'"/>
      </div>
    </el-dialog>

    <el-dialog :title="dataFieldDetails && dataFieldDetails.chineseName ? dataFieldDetails.name + '(' + dataFieldDetails.chineseName + ') 数据预览' : '数据预览'"
               :visible.sync="isDataViewDlgVisible"
               append-to-body
               class="field-detail-dialog data-view-dialog">
      <p class="field-data-view-total">共 {{sampleData && sampleData.data && sampleData.data.length}} 条数据</p>
      <el-table v-if="sampleData" :data="sampleData.data.slice(0, 10)" height="400" style="width: 100%">
        <el-table-column v-for="(col, idx) in sampleData.columns"
                         :key="col"
                         :prop="col"
                         :label="col"
                         :fixed="idx === 0">
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="申请数据权限"
               :visible.sync="isAccessibilityDig"
               append-to-body
               class="field-detail-dialog">
      <el-form ref="accessibilityForm"
               :model="accessibilityForm"
               :rules="accessibilityFormRules">
        <p class="field-data-view-total">您共申请 {{fieldSelection.length}} 个字段</p>
        <el-form-item label="申请原因" prop="reason">
          <el-input
            type="textarea"
            placeholder="请输入申请原因"
            v-model="accessibilityForm.reason"
            :autosize="{ minRows: 4, maxRows: 4}">
          </el-input>
        </el-form-item>
        <el-form-item label="到期时间" prop="sectionTime">
          <el-date-picker v-model="accessibilityForm.sectionTime"
                          type="date"
                          placeholder="选择日期"/>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="isAccessibilityDig = false">取消</el-button>
        <el-button type="primary" @click="validateAccessibility('accessibilityForm')">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog title="详情"
              :visible.sync="isFieldDetailDlgVisible"
               append-to-body
               width="795px"
               class="field-detail-dialog field-details analysis-dialog">
      <div slot="title"></div>
      <i class="field-details-close el-icon-close" @click="isFieldDetailDlgVisible = false"></i>
      <el-tabs type="border-card" v-model="activeName" @tab-click="handleTabClick" v-ej-loading="chartLoading">
        <el-tab-pane name="blood" label="血缘分析">
          <my-echart
            key="123"
            ref="blood"
            :from="fromList.blood.value"
            :option="blood.option"
            :other="blood.other"
            :tableList="blood.tableList"
            :params="blood.params"
            :height="blood.height"
            :width="blood.width"
            tableMaxHeight="460px"
            @change="bloodChange"
          />
        </el-tab-pane>
        <el-tab-pane name="effect" label="影响分析">
          <my-echart
            key="11123"
            ref="effect"
            :from="fromList.effect.value"
            :option="effect.option"
            :other="effect.other"
            :tableList="effect.tableList"
            :params="effect.params"
            tableMaxHeight="460px"
            :height="effect.height"
            :width="effect.width"
            @change="effectChange"
          />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Button as ElButton,
    Table as ElTable,
    TableColumn as ElTableColumn,
    Dialog as ElDialog,
    Form as ElForm,
    FormItem as ElFormItem,
    Input as ElInput,
    DatePicker as ElDatePicker,
  } from 'element-ui'

  import {Highlight, Loading} from '@ej/ui'
  import Lodash from 'lodash'

  import runtimeArgs from '@/runtime-args'
  import GenerateTreeData from './js/analysisData.js'
  import QUERY_ANALYSIS_COLUMN_DATA from '@/graphql/analysis_column.gql'
  import QUERY_FIELD_DATA from '@/graphql/details_field_list.gql'
  import QUERY_GENERATOR_DATA from '@/graphql/details_generator_ddl.gql'
  import QUERY_SAMPLE_DATA from '@/graphql/details_sample_datas.gql'
  import QUERY_DOWNLOAD_FIELD from '@/graphql/details_download_field.gql'
  import MUTATION_RECORD_PV from '@/graphql/detail_record_pv.gql'
  import QUERY_FIELD_APPLY_LIST from '@/graphql/details_field_user_apply_list.gql'
  import QUERY_FIELD_CREATE_APPLY from '@/graphql/detail_field_create_apply.gql'
  import CommonTable from '@/common-components/table'
  import Message from '@/utils/message'
  import {formatDate} from '@/utils/date.js'
  import MyEchart from './my-echart.vue'
  import enumData from '@/js/enum'

  Vue.use(Highlight)
  Vue.use(Loading)
  Vue.use(CommonTable)

  const FILE_DOWNLOAD_ADDRESS = runtimeArgs.VUE_APP_DOWNLOAD_HTTP

  // const analysisConfigs = [
  //   {
  //     'status': 1,
  //     'name': 'ALM',
  //     'id': 1,
  //   },
  //   {
  //     'status': 2,
  //     'name': 'AWP',
  //     'id': 2,
  //   },
  //   {
  //     'status': 1,
  //     'name': 'BHC',
  //     'id': 3,
  //   },
  // ]

  export default {
    name: 'FieldDetail',

    components: {
      ElButton,
      ElTable,
      ElTableColumn,
      ElDialog,
      ElForm,
      ElFormItem,
      ElInput,
      ElDatePicker,
      MyEchart,
    },

    data () {
      let checkDate = (rule, value, callback) => {
        if (!(new Date(value) > new Date())) {
          callback(new Error('请选择大于当前的一个日期'))
        } else {
          callback()
        }
      }
      return {
        isAccessibility: false,
        isAccessibilityDig: false,
        isDDLDlgVisible: false,
        isDataViewDlgVisible: false,
        isFieldDetailDlgVisible: false,
        fieldData: {},
        dialogTableVisible: false,
        fieldSelection: [],
        accessibilityForm: {
          reason: '',
          sectionTime: '',
        },
        accessibilityFormRules: {
          reason: [
            {required: true, message: '请填写申请原因', trigger: 'blur'},
            {min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur'},
          ],
          sectionTime: [
            {type: 'date', required: true, message: '请选择日期', trigger: 'change'},
            {validator: checkDate, trigger: 'change'},
          ],
        },
        blood: {
          id: 'blood',
          option: {},
          treeData: {},
          tableList: [],
          other: {},
          params: {
            show_view: 1,
            // relation: 0,
            fine_resolution: 0,
            depth: 3,
            // configs: analysisConfigs,
          },
          height: '',
          width: '',
        },
        effect: {
          id: 'effect',
          option: {},
          treeData: {},
          tableList: [],
          other: {},
          params: {
            show_view: 1,
            // relation: 0,
            fine_resolution: 0,
            depth: 3,
            // configs: analysisConfigs,
          },
          height: '',
          width: '',
        },
        fromList: enumData.echartFromList,
        activeName: 'blood',
        timer: null,
        currentDetailId: '',
        sampleData: null,
        chartLoading: false, // 图数据加载时的loading
        fieldApplyList: [], // 当前用户申请字段权限集合 [对象集合]
        fieldOriginalApplyList: [], // 当前用户申请字段权限集合-[原始数据 id集合]
      }
    },

    watch: {
      activeName (val) {
        switch (val) {
          case 'blood':
            this.$refs.blood.resize()
            break
          case 'effect':
            this.$refs.effect.resize()
            break
        }
      },
    },

    apollo: {
      dataFieldDetails: {
        query: QUERY_FIELD_DATA,
        variables () {
          return {
            mdsObjectId: this.$route.params.dataId,
          }
        },
        update (data) {
          const _dataFieldDatails = data.dataFieldDetails
          this.getFieldApplyList(_dataFieldDatails.fieldDetail)
          return _dataFieldDatails
        },
      },
      generateDDL: {
        query: QUERY_GENERATOR_DATA,
        variables () {
          return {
            mdsObjectId: this.$route.params.dataId,
          }
        },
        update: data => data.generateDDL,
      },
    },

    methods: {
      toJSON (val) {
        return val ? JSON.parse(val) : ''
      },

      heatLevel (levelValue = 1) {
        let levelArr = ['signal-level-1', 'signal-level-2', 'signal-level-3', 'signal-level-4', 'signal-level-5']
        return levelArr[levelValue - 1]
      },

      handleTabClick (pane) {
        if (pane.name === 'blood') {
          this.loadBlood()
        }
        if (pane.name === 'effect') {
          this.loadEffect()
        }
      },

      async loadBlood (params = {}) {
        await this.sendBloodAnalysis({
          id: this.currentDetailId,
          numberOfLayers: this.blood.params.depth,
          isHideViewMacroStoredProcedureUDF: !!this.blood.params.show_view,
          ...params,
        })
        this.bloodDepth = this.blood.params.depth

        this.blood.other = {
          'direct_tier': this.blood.treeData.children ? this.blood.treeData.children.length : 0,
          'tier': this.blood.params.depth,
          'data_total': this.blood.tableList.length - 1,
        }

        this.setBloodOption(this.blood.treeData)
      },

      async loadEffect (params = {}) {
        await this.sendEffectAnalysis({
          id: this.currentDetailId,
          numberOfLayers: this.effect.params.depth,
          isHideViewMacroStoredProcedureUDF: !!this.effect.params.show_view,
          ...params,
        })
        this.effectDepth = this.effect.params.depth

        this.effect.other = {
          'direct_tier': this.effect.treeData.children ? this.effect.treeData.children.length : 0,
          'tier': this.effect.params.depth,
          'data_total': this.effect.tableList.length - 1,
        }

        this.setEffectOption(this.effect.treeData)
      },

      async sendBloodAnalysis (params = {}) {
        this.chartLoading = true
        const respData = await this.$apollo.query({
          query: QUERY_ANALYSIS_COLUMN_DATA,
          variables: {
            input: {
              id: this.currentDetailId,
              upDepth: this.blood.params.depth,
              downDepth: 0,
            },
          },
        })

        this.chartLoading = false
        this.blood.treeData = Lodash.cloneDeep(respData)
        this.setBloodOption(this.blood.treeData)

        const bloodTree = GenerateTreeData.generateTree(respData.data.analysis, this.currentDetailId, 'blood')
        this.blood.tableList = bloodTree.table
      },

      async sendEffectAnalysis (params = {}) {
        this.chartLoading = true
        const respData = await this.$apollo.query({
          query: QUERY_ANALYSIS_COLUMN_DATA,
          variables: {
            input: {
              id: this.currentDetailId,
              upDepth: 0,
              downDepth: this.effect.params.depth,
            },
          },
        })

        this.chartLoading = false

        const effectTree = GenerateTreeData.generateTree(Lodash.cloneDeep(respData.data.analysis), this.currentDetailId, 'effect')
        this.effect.tableList = effectTree.table
        this.effect.treeData = respData
        this.setEffectOption(respData)
      },

      bloodChange (params) {
        if (params.depth < this.bloodDepth) {
          // 重置-缓存深度
          this.bloodDepth = params.depth
          clearTimeout(this.timer)
          const _bloodData = this.blood.tableList.filter(bd => bd.tier <= params.depth)
          const bloodTree = GenerateTreeData.generateTree(_bloodData)
          this.setBloodOption(bloodTree)
        } else {
          this.timer = setTimeout(() => {
            this.loadBlood({
              isHideViewMacroStoredProcedureUDF: !!params.show_view,
              isOnlyShowInteriorRelation: !!params.relation,
              isFineAnalysis: !!params.fine_resolution,
              numberOfLayers: params.depth,
            })
          }, 300)
        }
      },

      effectChange (params) {
        if (params.depth < this.effectDepth) {
          // 重置-缓存深度
          this.bloodDepth = params.depth
          clearTimeout(this.timer)
          const _effectData = this.effect.tableList.filter(bd => bd.tier <= params.depth)
          const effectTree = GenerateTreeData.generateTree(_effectData)
          this.setEffectOption(effectTree)
        } else {
          this.timer = setTimeout(() => {
            this.loadEffect({
              isHideViewMacroStoredProcedureUDF: !!params.show_view,
              isOnlyShowInteriorRelation: !!params.relation,
              isFineAnalysis: !!params.fine_resolution,
              numberOfLayers: params.depth,
            })
          }, 300)
        }
      },

      setEffectOption (data) {
        /*
        * 设置折叠
        */
        /*
        echarts.util.each(data.children, function (datum, index) {
          index % 2 === 0 && (datum.collapsed = true)
        })
        */
        const SPACING_X = 200
        const SPACING_Y = 40
        const BASE_ID = this.currentDetailId
        const {data: {analysis: {nodes, edges}}} = data

        const nodesMap = nodes.reduce((map, node) => {
          map[node.id] = node
          return map
        }, {})

        Object.assign(nodes.find(({id}) => id === BASE_ID), {level: 0})
        void (function calcLevels (parentNodeIds) {
          const nextLevel = nodesMap[parentNodeIds[0]].level + 1
          const childNodeIds = edges.filter(([from]) => parentNodeIds.includes(from)).map(([, to]) => to)
          if (childNodeIds.length) {
            for (const node of childNodeIds.map(id => nodesMap[id])) {
              node.level = nextLevel
            }
            calcLevels(childNodeIds)
          }
        }([BASE_ID]))

        const nodeLevels = nodes.reduce((levels, {level, id}) => {
          if (!levels[level]) {
            levels[level] = []
          }
          levels[level].push(id)
          return levels
        }, [])
        const levelSizes = nodeLevels.map(ids => ids.length)
        const maxY = SPACING_Y * (Math.max(...levelSizes) - 1)
        nodeLevels.forEach((ids, x) => {
          const offset = (maxY - (ids.length - 1) * SPACING_Y) / 2
          ids.forEach((id, y) => {
            const node = nodesMap[id]
            node.x = SPACING_X * x
            node.y = offset + SPACING_Y * y
          })
        })
        this.effect.height = `${maxY}px`
        let width = (14 + SPACING_X) * levelSizes.length - SPACING_X + 190 + 20 + 200
        this.effect.width = `${width}px`
        this.effect.option = {
          tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            padding: [16, 24],
            formatter: (params) => {
              let _params = params.data
              let _etljobs = _params && _params.etljobs ? _params.etljobs.map(e => e.name).join(',') : '--'
              return `<p>字段名称: ${_params && _params.columnName ? _params.columnName : '--'}</p>
                      <p>映射脚本: ${_etljobs}</p>
                      <p>注释: ${_params && _params.desc ? _params.desc : '--'}</p>`
            },
          },
          series: [{
            type: 'graph',
            left: 20,
            top: 20,
            // bottom: 20,
            focusNodeAdjacency: true,
            label: {
              show: true,
              position: 'right',
              formatter: (val) => {
                let num = 20
                return val.name.length > num ? `${val.name.slice(0, num)}...` : val.name
              },
            },
            lineStyle: {
              curveness: 0.05,
            },
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: 8,
            nodes,
            edges: edges.map(([source, target]) => ({
              source,
              target,
            })),
          }],
        }
      },

      setBloodOption (data) {
        /*
        * 设置折叠
        */
        /*
        echarts.util.each(data.children, function (datum, index) {
          index % 2 === 0 && (datum.collapsed = true)
        })
        */
        const SPACING_X = -200
        const SPACING_Y = 40
        const BASE_ID = this.currentDetailId
        const {data: {analysis: {nodes, edges}}} = data

        const nodesMap = nodes.reduce((map, node) => {
          map[node.id] = node
          return map
        }, {})

        Object.assign(nodes.find(({id}) => id === BASE_ID), {level: 0})
        void (function calcLevels (parentNodeIds) {
          const nextLevel = nodesMap[parentNodeIds[0]].level + 1
          const childNodeIds = edges.filter(([from, to]) => parentNodeIds.includes(to)).map(([from]) => from)
          if (childNodeIds.length) {
            for (const node of childNodeIds.map(id => nodesMap[id])) {
              node.level = nextLevel
            }
            calcLevels(childNodeIds)
          }
        }([BASE_ID]))

        const nodeLevels = nodes.reduce((levels, {level, id}) => {
          if (!levels[level]) {
            levels[level] = []
          }
          levels[level].push(id)
          return levels
        }, [])
        const levelSizes = nodeLevels.map(ids => ids.length)
        const maxY = SPACING_Y * (Math.max(...levelSizes) - 1)
        nodeLevels.forEach((ids, x) => {
          const offset = (maxY - (ids.length - 1) * SPACING_Y) / 2
          ids.forEach((id, y) => {
            const node = nodesMap[id]
            node.x = SPACING_X * x
            node.y = offset + SPACING_Y * y
          })
        })
        this.blood.height = `${maxY}px`
        let width = (14 + (-SPACING_X)) * levelSizes.length - (-SPACING_X) + 190 + 20 + 100
        this.blood.width = `${width}px`
        this.blood.option = {
          tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            padding: [16, 24],
            formatter: (params) => {
              let _params = params.data
              let _etljobs = _params && _params.etljobs ? _params.etljobs.map(e => e.name).join(',') : '--'
              return `<p>字段名称: ${_params && _params.columnName ? _params.columnName : '--'}</p>
                      <p>映射脚本: ${_etljobs}</p>
                      <p>注释: ${_params && _params.desc ? _params.desc : '--'}</p>`
            },
          },
          series: [{
            type: 'graph',
            focusNodeAdjacency: true,
            left: 20,
            top: 20,
            // bottom: 20,
            label: {
              show: true,
              position: 'right',
              formatter: (val) => {
                let num = 20
                return val.name.length > num ? `${val.name.slice(0, num)}...` : val.name
              },
            },
            lineStyle: {
              curveness: 0.05,
            },
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: 8,
            nodes,
            edges: edges.map(([source, target]) => ({
              source,
              target,
            })),
          }],
        }
      },

      handleFieldDetail (id) {
        if (this.currentDetailId !== id) {
          const defaultParams = {
            show_view: 1,
            // relation: 0,
            fine_resolution: 0,
            depth: 3,
            // configs: analysisConfigs,
          }
          this.activeName = 'blood'
          this.blood.params = Object.assign(this.blood.params, defaultParams)
          this.effect.params = Object.assign(this.effect.params, defaultParams)
          this.currentDetailId = id
          this.loadBlood()
        }
        this.isFieldDetailDlgVisible = true

        // 记录详情的PV
        this.$apollo.mutate({
          mutation: MUTATION_RECORD_PV,
          variables: {
            id,
          },
        })
      },

      handleSelectionChange (val) {
        this.fieldSelection = val
      },

      /**
       * 获取当前用户已经申请过的字段集合
       */
      async getFieldApplyList (srouceData) {
        const {data: {applyFieldIdList}} = await this.$apollo.query({
          query: QUERY_FIELD_APPLY_LIST,
          variables: {
            mdsObjectId: this.$route.params.dataId,
          },
        })
        // const applyFieldIdList = ["133259865891148124", "133259865891148128", "133259865891148130"]
        if (applyFieldIdList) {
          let fieldObj = []

          for (const e of applyFieldIdList) {
            const obj = srouceData.find(field => field.id === e)
            if (obj) {
              fieldObj.push(obj)
            }
          }
          this.fieldApplyList = fieldObj
          this.fieldOriginalApplyList = applyFieldIdList
        }
      },

      async handleAccessibility () {
        // 清空勾选项，以获取当前用户已有申请权限为主
        this.$refs.fieldTable.clearSelection()
        this.isAccessibility = !this.isAccessibility
      },

      handleSubmitbility () {
        if (this.fieldSelection.length > 0) {
          this.isAccessibilityDig = true
        } else {
          Message.MessageError({messageErrorText: '请选择需要申请的字段'})
        }
      },

      validateAccessibility (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.sendAccessibilityRequest()
            this.isAccessibilityDig = false
            this.isAccessibility = false
          } else {
            return false
          }
        })
      },

      /**
       * 发送申请权限请求
       */
      async sendAccessibilityRequest () {
        // 剔除已经申请过的字段
        let _mdsFieldIds = this.fieldSelection.filter(fs => {
          if (!this.fieldOriginalApplyList.includes(fs.id)) {
            return fs
          }
        })

        try {
          const {data: {createFieldApply}} = await this.$apollo.mutate({
            mutation: QUERY_FIELD_CREATE_APPLY,
            variables: {
              input: {
                mdsTabId: this.$route.params.dataId,
                expireTm: formatDate(new Date(this.accessibilityForm.sectionTime), 'YYYY-MM-DD'),
                reason: this.accessibilityForm.reason,
                mdsFieldIds: [..._mdsFieldIds.map(fs => fs.id)],
              },
            },
          })

          if (createFieldApply) {
            Message.MessageSuccess({messageSuccessText: '申请权限提交成功'})
            // 提交之后，重新获取已经申请字段的权限集合
            this.getFieldApplyList(this.dataFieldDetails.fieldDetail)
            // 申请表单置空
            this.accessibilityForm = {
              reason: '',
              sectionTime: '',
            }
          }
        } catch (error) {
          Message.MessageError({messageErrorText: '申请权限提交失败'})
        }
      },

      async downloadFieldData () {
        const respData = await this.$apollo.query({
          query: QUERY_DOWNLOAD_FIELD,
          variables: {
            mdsObjectId: this.$route.params.dataId,
          },
        })

        const downloadField = respData.data.downloadFiled

        let _downloadAddress = `${FILE_DOWNLOAD_ADDRESS}?ambryId=${downloadField}`

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

      async handleSampleData () {
        const {data: {getSampleDatas}} = await this.$apollo.query({
          query: QUERY_SAMPLE_DATA,
          variables: {
            mdsObjectId: this.$route.params.dataId,
          },
          update: data => data.getSampleDatas,
        })
        if (getSampleDatas && getSampleDatas.columns.length > 0) {
          const sample = {
            columns: getSampleDatas.columns,
            data: JSON.parse(getSampleDatas.data),
          }

          this.sampleData = sample
        } else {
          this.sampleData = {
            columns: [],
            data: [],
          }
        }
        this.isDataViewDlgVisible = true
      },

      destroyed () {
        clearTimeout(this.timer)
      },
    },
  }
</script>

<style lang="scss">
  .field-detail {
    &-dialog {
      .el-table td{
        padding: 7px 0;
      }

      .el-dialog__title {
        @apply text-base text-black;
      }

      .el-dialog__header {
        @apply border-b border-solid border-gray-lighter;
      }

      .el-dialog__body {
        padding: 2px 20px 10px;
      }

      &.analysis-dialog {
         .el-tabs--border-card>.el-tabs__content {
          padding: 0 !important;
        }
      }

      &.field-details {
        .el-tabs__content {
          min-height: 300px;
        }

        .el-dialog__body,
        .el-dialog__header {
          padding: 0;
          position: relative;
        }
        .field-details-close {
          position: absolute;
          right: 10px;
          top: 10px;
          z-index: 1;
          cursor: pointer;
          @apply text-2xl text-gray-dark;
        }
        .field-details-close:hover {
          @apply text-blue;
        }

        .blood-analysis .echart {
          @apply w-full;
        }

        .el-checkbox__input.is-checked .el-checkbox__inner,
        .el-checkbox__input.is-indeterminate .el-checkbox__inner {
          @apply bg-blue border-blue;
        }

        .el-checkbox__input.is-checked+.el-checkbox__label {
          @apply text-blue;
        }
        .el-slider__bar {
          @apply bg-blue;
        }
        .el-slider__button {
          @apply border-2 border-solid border-blue;
        }
        .el-tabs__item.is-active {
          @apply text-blue;
        }
        .el-tabs__active-bar {
          @apply bg-blue;
        }
        .el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active {
          @apply text-blue;
        }
        .el-radio-button__orig-radio:checked+.el-radio-button__inner {
          @apply bg-blue border-blue;
        }
        .el-radio-button {
          margin-bottom: -1px;
        }
      }
    }
  }

  .field {
    &-view {
      padding: 15px;

      .flex {
        display: flex;
        align-items: center;

        &.vertical {
          flex-direction: column;
        }

        &.justify {
          justify-content: space-between;
        }

        &-item {
          flex: 1 1 0px;

          &.solid {
            flex: 0 0 auto;
          }
        }
      }
    }

    &-data-view-total {
      line-height: 17px;
      @apply text-sm text-gray-darker;
    }

    &-ddl {
      height: 540px;
      overflow-y: auto;
    }

    &-content {
      margin-top: 5px;
      .common-icon {
        display: inline-block;
        margin-left: 10px;
      }

      .el-table--scrollable-x .el-table__body-wrapper {
        overflow-x: hidden;
      }

      .field-detail-btn {
        padding: 0 !important;
      }

      .signal-level {
        width: 23px;
        height: 20px;
      }

      svg {
        fill: #477de9;
      }

      .el-checkbox__input.is-disabled.is-checked {
        .el-checkbox__inner {
          @apply opacity-50;
        }
      }
    }

    &-header-buttons {
      .el-button {
        @apply border border-solid border-theme-color text-theme-color;

        padding: 4px 9px;
      }
    }

    &-header-count {
      line-height: 17px;
      @apply text-sm text-gray-darker;
    }
  }
</style>
