<template>
  <div class="detail-view" v-ej-loading.fullscreen="$apollo.queries.dataDetails.loading">
    <header class="detail-view__header">
      <h1 v-if="dataDetails" class="font-semibold">
        <span class="en">{{dataDetails.name}}</span>
        <span v-if="dataDetails.chineseName" class="zh">{{dataDetails.chineseName}}</span>
      </h1>
      <div class="buttons">
        <a href="javascript:"
           class="flex items-center"
           :style="{opacity: isSettingFavorite ? .5 : undefined}"
           @click="handleCollect">
          <ej-icon :icon="isFavorite ? 'star' : 'star-o'" :key="isFavorite ? 'star' : 'star-o'"/>
          <span>{{isFavorite ? '已收藏' : '收藏'}}</span>
        </a>
        <a href="javascript:"
           class="flex items-center"
           :style="{opacity: isSettingWatched ? .5 : undefined}"
           @click="handleWatched">
          <ej-icon :icon="isWatched ? 'pin' : 'pin-o'" :key="isWatched ? 'pin' : 'pin-o'"/>
          <span>{{isWatched ? '已订阅' : '订阅'}}</span>
        </a>
        <a href="javascript:"
           class="flex items-center"
           :class="{active: isQuestionPanelVisible}"
           @click="isQuestionPanelVisible = !isQuestionPanelVisible">
          <ej-icon icon="edit"/>
          <span>提问</span>
        </a>
      </div>
    </header>

    <div class="wrapper flex" :class="{moved: isQuestionPanelVisible}">
      <!-- 详情面板 -->
      <info-panel v-bind="$data" class="aside"/>

      <!-- 主体 -->
      <div class="detail-view__main block bg-white flex-auto" style="position: relative;" v-ej-loading="chartLoading">
        <!-- mongo or es or hbase 显示 tree table -->
        <div v-if="dataDetails && [dbTypeEnum.MongoDB, dbTypeEnum.ElasticSearch, dbTypeEnum.HBase].includes(dataDetails.dbSourceType)">
          <mongo-field-details :data="dataDetails"/>
        </div>
        <el-tabs v-else v-model="tabActiveName" @tab-click="handleTabClick">
          <el-tab-pane label="字段明细">
            <field-details/>
          </el-tab-pane>
          <el-tab-pane name="blood" label="血缘分析">
            <my-echart
              ref="blood"
              :from="fromList.blood.value"
              :option="blood.option"
              :other="blood.other"
              :tableList="blood.tableList"
              :params="blood.params"
              :height="blood.height"
              :width="blood.width"
              @change="bloodChange"
            />
          </el-tab-pane>
          <el-tab-pane name="effect" label="影响分析">
            <my-echart
              ref="effect"
              :from="fromList.effect.value"
              :option="effect.option"
              :other="effect.other"
              :tableList="effect.tableList"
              :params="effect.params"
              :height="effect.height"
              :width="effect.width"
              @change="effectChange"
            />
          </el-tab-pane>
          <el-tab-pane label="版本信息">
            <versions-view/>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 问题面板 -->
      <question-panel class="aside"/>
    </div>
    <el-backtop class="z-50" :bottom="20" :right="10"><i class="el-icon-thumb"></i></el-backtop>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Button,
    Input,
    TabPane,
    Tabs,
    Backtop as ElBacktop,
  } from 'element-ui'

  import {Icon, Loading} from '@ej/ui'
  import Lodash from 'lodash'

  import GenerateTreeData from './js/analysisData.js'
  import QUERY_ANALYSIS_OBJECT_DATA from '@/graphql/analysis_object.gql'
  import QUERY_DETAILS_DATA from '@/graphql/details_data.gql'
  import MUTATION_COLLECT_OPERA from '@/graphql/collect_opera.gql'
  import MUTATION_WATCHED_OPERA from '@/graphql/watched_opera.gql'
  import MUTATION_TAG_CREATE from '@/graphql/tag-create.gql'
  import MUTATION_TAG_LIST from '@/graphql/tag-list.gql'
  import MUTATION_TAG_OPERA from '@/graphql/tag-opera.gql'
  import MUTATION_TAG_REMOVE from '@/graphql/tag-remove.gql'
  import InfoPanel from './info-panel.vue'
  import QuestionPanel from './question-panel.vue'
  import FieldDetails from './field-details.vue'
  import MongoFieldDetails from './mongo-field-details.vue'
  import VersionsView from './versions-view.vue'
  import MyEchart from './my-echart.vue'
  import enumData from '@/js/enum'
  import Message from '@/utils/message'
  import {wait} from '@/utils/async'
  import {DbTypeEnum} from '@/utils/dictionary'

  Vue.use(Button)
  Vue.use(Input)
  Vue.use(Tabs)
  Vue.use(TabPane)

  Vue.use(Icon)
  Vue.use(Loading)

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
    name: 'DetailView',

    components: {
      ElBacktop,
      InfoPanel,
      QuestionPanel,
      FieldDetails,
      MongoFieldDetails,
      VersionsView,
      MyEchart,
    },

    data () {
      return {
        dataObject: {
          isFavorite: false,
          isWatched: false,
        },

        tabActiveName: '',

        isSettingFavorite: false,
        isSettingWatched: false,

        isQuestionPanelVisible: false,
        bloodDepth: undefined,
        effectDepth: undefined,
        blood: {
          id: 'blood',
          option: {},
          tableList: [],
          treeData: {},
          other: {},
          params: {
            show_view: 1,
            // relation: 0,
            fine_resolution: 0,
            depth: 2,
            // configs: analysisConfigs,
          },
          height: '',
        },
        effect: {
          id: 'effect',
          option: {},
          tableList: [],
          treeData: {},
          other: {},
          params: {
            show_view: 1,
            // relation: 0,
            fine_resolution: 0,
            depth: 2,
            // configs: analysisConfigs,
          },
          height: '',
        },
        fromList: enumData.echartFromList,
        timer: null,
        chartLoading: false, // 图数据加载时的loading
      }
    },

    apollo: {
      dataDetails: {
        query: QUERY_DETAILS_DATA,
        variables () {
          return {
            mdsObjectId: this.$route.params.dataId,
            isRecordPv: true,
          }
        },
        fetchPolicy: 'network-only',
        error (error) {
          console.log('错误日志', error)
        },
        update (data) {
          if (data.dataDetails && data.dataDetails.userData) {
            this.isFavorite = data.dataDetails.userData.saved
            this.isWatched = data.dataDetails.userData.watched
          }
          return data.dataDetails
        },
      },
    },

    computed: {
      isFavorite: {
        get () {
          return this.dataObject.isFavorite
        },
        set (val) {
          this.isSettingFavorite = true
          wait().then(_ => {
            this.$set(this.dataObject, 'isFavorite', val)
          }).then(_ => (this.isSettingFavorite = false))
        },
      },
      isWatched: {
        get () {
          return this.dataObject.isWatched
        },
        set (val) {
          this.isSettingWatched = true
          wait().then(_ => {
            this.$set(this.dataObject, 'isWatched', val)
          }).then(_ => (this.isSettingWatched = false))
        },
      },
      dbTypeEnum: () => DbTypeEnum,
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

    mounted () {
      if (this.$route.query.source && this.$route.query.source === 'dqs') {
        this.tabActiveName = 'effect'
        setTimeout(() => {
          this.loadEffect()
        }, 500)
      }
    },

    methods: {
      /**
       * 发送邮件
       */
      sendMail () {
        console.log('发送邮件')
      },

      async handleTagCreate (tag) {
        await this.$apollo.mutate({
          mutation: MUTATION_TAG_CREATE,
          variables: {
            mdsObjectId: this.dataDetails.id,
            tagName: tag,
          },
          update: async (store, {data: {createTag}}) => {
            const data = store.readQuery({
              query: QUERY_DETAILS_DATA,
              variables: {mdsObjectId: this.$route.params.dataId},
            })
            if (createTag.id) { // 加入的标签在库中 不存在
              data.dataDetails.tags.push(createTag)
            } else { // 加入的标签在库中 已经存在
              const respTag = await this.$apollo.query({
                query: MUTATION_TAG_LIST,
                variables: {
                  mdsObjectId: this.$route.params.dataId,
                  isRecordPv: true,
                },
                fetchPolicy: 'network-only',
                update: data => data.tagList.data,
              })
              data.dataDetails.tags = respTag.tagList.tags || []
            }
            store.writeQuery({query: QUERY_DETAILS_DATA, data})
          },
        })

        this.$apollo.queries.dataDetails.refresh()
      },

      /**
       * 标签点赞
       * @param {Object} [tag] 标签对象
       * @param {Boolean} [operations] 当前触发动作 true:增加 false:减少
       */
      handleTagScoreUpAndDown (tag, operations) {
        const tagId = tag.id
        this.$apollo.mutate({
          mutation: MUTATION_TAG_OPERA,
          variables: {
            mdsObjectId: this.dataDetails.id,
            tagId: tagId,
            isOperations: operations,
          },
        })
      },

      async handleTagRemove (tagId) {
        await this.$apollo.mutate({
          mutation: MUTATION_TAG_REMOVE,
          variables: {
            mdsObjectId: this.dataDetails.id,
            tagId: tagId,
          },
        })

        this.$apollo.queries.dataDetails.refresh()
      },

      handleTabClick (pane) {
        (pane.$children || []).forEach(vm => vm.$options._name === 'MyEchart' ? vm.resize() : undefined)
        if (pane.name === 'blood') {
          this.loadBlood()
        }
        if (pane.name === 'effect') {
          this.loadEffect()
        }
      },

      async loadBlood (params = {}) {
        await this.sendBloodAnalysis({
          id: this.$route.params.dataId,
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
          id: this.$route.params.dataId,
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
          query: QUERY_ANALYSIS_OBJECT_DATA,
          variables: {
            input: {
              id: this.$route.params.dataId,
              upDepth: this.blood.params.depth,
              downDepth: 0,
            },
          },
        })

        this.chartLoading = false
        this.blood.treeData = Lodash.cloneDeep(respData)
        this.setBloodOption(this.blood.treeData)
        const bloodTree = GenerateTreeData.generateTree(respData.data.analysis, this.$route.params.dataId, 'blood')
        this.blood.tableList = bloodTree.table
      },

      async sendEffectAnalysis (params = {}) {
        this.chartLoading = true
        const respData = await this.$apollo.query({
          query: QUERY_ANALYSIS_OBJECT_DATA,
          variables: {
            input: {
              id: this.$route.params.dataId,
              upDepth: 0,
              downDepth: this.effect.params.depth,
            },
          },
        })
        this.chartLoading = false
        const effectTree = GenerateTreeData.generateTree(Lodash.cloneDeep(respData.data.analysis), this.$route.params.dataId, 'effect')
        this.effect.tableList = effectTree.table
        // this.effect.tableList = respData.data.analysis.nodes
        this.effect.treeData = respData
        this.setEffectOption(respData)
      },

      handleCollect () {
        let operations = !this.dataObject.isFavorite
        this.operaCollect(operations)
      },

      handleWatched () {
        let operations = !this.dataObject.isWatched
        this.operaSubscribe(operations)
      },

      /**
       * 用户收藏
       *
       * @param {Boolean} [operations] 当前触发动作 true:收藏 false:取消收藏
       */
      operaCollect (operations) {
        this.$apollo.mutate({
          mutation: MUTATION_COLLECT_OPERA,
          variables: {
            mdsObjectId: this.$route.params.dataId,
            isOperations: operations,
          },
          update: (store, {data: {collectOpera}}) => {
            this.dataObject.isFavorite = !this.dataObject.isFavorite
            Message.MessageSuccess({messageSuccessText: this.dataObject.isFavorite ? '收藏成功' : '已取消收藏'})
          },
        })
      },

      /**
       * 用户订阅
       *
       * @param {Boolean} [operations] 当前触发动作 true:订阅 false:取消订阅
       */
      operaSubscribe (operations) {
        this.$apollo.mutate({
          mutation: MUTATION_WATCHED_OPERA,
          variables: {
            mdsObjectId: this.$route.params.dataId,
            isOperations: operations,
          },
          update: (store, {data: {watchedOpera}}) => {
            this.dataObject.isWatched = !this.dataObject.isWatched
            Message.MessageSuccess({messageSuccessText: this.dataObject.isWatched ? '订阅成功' : '已取消订阅'})
          },
        })
      },

      bloodChange (params) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.loadBlood({
            isHideViewMacroStoredProcedureUDF: !!params.show_view,
            isOnlyShowInteriorRelation: !!params.relation,
            isFineAnalysis: !!params.fine_resolution,
            numberOfLayers: params.depth,
          })
        }, 300)
        // if (params.depth < this.bloodDepth) { // 注：当 所选层级参数 小于 已加载数据的层级时，不向后端发请求，直接用已有数据筛选层级
        //   // 重置-缓存深度
        //   this.bloodDepth = params.depth
        //   clearTimeout(this.timer)
        //   const _bloodData = this.blood.tableList.filter(bd => bd.tier <= params.depth)
        //   const bloodTree = GenerateTreeData.generateTree(_bloodData)
        //   this.setBloodOption(bloodTree)
        // } else {
        //   this.timer = setTimeout(() => {
        //     this.loadBlood({
        //       isHideViewMacroStoredProcedureUDF: !!params.show_view,
        //       isOnlyShowInteriorRelation: !!params.relation,
        //       isFineAnalysis: !!params.fine_resolution,
        //       numberOfLayers: params.depth,
        //     })
        //   }, 300)
        // }
      },

      effectChange (params) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.loadEffect({
            isHideViewMacroStoredProcedureUDF: !!params.show_view,
            isOnlyShowInteriorRelation: !!params.relation,
            isFineAnalysis: !!params.fine_resolution,
            numberOfLayers: params.depth,
          })
        }, 300)

        // if (params.depth < this.effectDepth) { // 注：当 所选层级参数 小于 已加载数据的层级时，不向后端发请求，直接用已有数据筛选层级
        //   // 重置-缓存深度
        //   this.bloodDepth = params.depth
        //   clearTimeout(this.timer)
        //   const _effectData = this.effect.tableList.filter(bd => bd.tier <= params.depth)
        //   const effectTree = GenerateTreeData.generateTree(_effectData)
        //   this.setEffectOption(effectTree)
        // } else {
        //   this.timer = setTimeout(() => {
        //     this.loadEffect({
        //       isHideViewMacroStoredProcedureUDF: !!params.show_view,
        //       isOnlyShowInteriorRelation: !!params.relation,
        //       isFineAnalysis: !!params.fine_resolution,
        //       numberOfLayers: params.depth,
        //     })
        //   }, 300)
        // }
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
        const BASE_ID = this.$route.params.dataId
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
              return `<p>平台名称： ${_params && _params.platformName ? _params.platformName : '--'}</p>
                      <p>库名称： ${_params && _params.databaseName ? _params.databaseName : '--'}</p>
                      <p>表名称： ${_params && _params.name ? _params.name : '--'}</p>
                      <p>表注释： ${_params && _params.desc ? _params.desc : '--'}</p>`
            },
          },
          series: [{
            type: 'graph',
            focusNodeAdjacency: true,
            left: 20,
            // top: 20,
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
        const BASE_ID = this.$route.params.dataId
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
              return `<p>平台名称： ${_params && _params.platformName ? _params.platformName : '--'}</p>
                      <p>库名称： ${_params && _params.databaseName ? _params.databaseName : '--'}</p>
                      <p>表名称： ${_params && _params.name ? _params.name : '--'}</p>
                      <p>表注释： ${_params && _params.desc ? _params.desc : '--'}</p>`
            },
          },
          series: [{
            type: 'graph',
            focusNodeAdjacency: true,
            left: 20,
            // top: 20,
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

      destroyed () {
        clearTimeout(this.timer)
      },
    },
  }
</script>

<style lang="scss">
  @import './variables.scss';

  .detail-view {
    // height: 100%;
    overflow: hidden;

    .el-table td {
      padding: 7px 0;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner,
    .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      @apply bg-blue border-blue;
    }

    .el-checkbox__input.is-checked + .el-checkbox__label {
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

    .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
      @apply text-blue;
    }

    &__header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      h1 {
        flex: none;
        margin: 0;
        line-height: 1.4;
        @apply text-lg;

        .zh {
          &::before {
            content: '（';
          }

          &::after {
            content: '）';
          }
        }
      }

      > .buttons {
        flex: none;
        margin-left: auto;
        display: flex;

        a {
          margin-left: 20px;

          &.active {
            @apply .text-theme-color;
          }

          > * {
            vertical-align: middle;
          }
        }

        svg {
          width: 14px;
          height: 14px;
          @apply fill-theme-color;
          margin-right: 5px;
        }
      }
    }

    > .wrapper {
      width: calc(100% + #{$sider-width + $column-gap});
      transform: translateX(0);
      transition: transform 300ms ease-out;
      white-space: nowrap;

      &.moved {
        transform: translateX(-#{$sider-width + $column-gap});
      }

      > .aside {
        width: $sider-width;
      }
    }

    &__main {
      width: calc(100% - #{$sider-width * 2 + $column-gap * 2});
      margin: 0 $column-gap;

      .el-tabs__item {
        @apply font-semibold text-base;
      }

      /* override element-ui's style */
      .el-radio-button {
        margin-bottom: -1px;
      }

      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        @apply bg-blue border-blue;
      }

      .el-tabs {
        flex: 1 1 1px;

        &__header {
          margin-bottom: 0;
          @apply bg-white;
        }

        &__nav-wrap {
          padding: 0 15px;

          &::after {
            //content: none;
            height: 1px;
          }
        }

        &__nav {
          //margin-bottom: 5px;
        }

        &__active-bar {
          height: 3px;
        }

        &__content {
          @apply bg-white;
        }
      }
    }
  }
</style>
