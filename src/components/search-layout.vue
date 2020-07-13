<template>
  <div class="search-layout">
    <div class="search-layout-header">
      <ej-search-list ref="ejSearchList"
                    :models.sync="models"
                    :default-tag-more="true"
                    app-key="MDS"
                    :view-id="viewId"
                    max-width-tag="400px"
                    @search="handleSearch">
          <template #input>
            <ej-search-input v-model="modelsKeyword" class="search-content-input" @search="handleSearch('btn')"/>
          </template>

          <template #default>
            <ej-search-option-cascader v-show="techShow"
                                       v-model="models[datas[0].key]"
                                       :no-multiple="true"
                                       :prop="datas[0].key"
                                       :props="{label: 'name', value: 'id'}"
                                       :label="datas[0].label"
                                       :options="$store.state.categories.find(c => c.id === 'tech').childern"
                                       placeholder="请选择技术类目"/>
            <ej-search-option-cascader v-show="busiShow"
                                       :no-multiple="true"
                                       :prop="datas[1].key"
                                       :props="{label: 'name', value: 'id'}"
                                       v-model="models[datas[1].key]"
                                       :label="datas[1].label"
                                       :options="$store.state.categories.find(c => c.id === 'busi').childern"
                                       placeholder="请选择业务类目"/>
            <ej-search-option-select :prop="datas[2].key"
                                     v-model="models[datas[2].key]"
                                     :label="datas[2].label"
                                     :options="datas[2].options"
                                     :select-props="[{placeholder: '请选择数据期限'},
                                                    {placeholder: '请选择资产等级'},
                                                    {placeholder: '请选择安全等级'},
                                                    {placeholder: '请选择数据类型'}]"/>
            <div v-show="tagList && tagList.length > 0" class="search-tag-list-wrap relative">
              <ej-search-option-list  :prop="datas[3].key"
                                      v-model="models[datas[3].key]"
                                      :label="datas[3].label"
                                      :options="datas[3].options"
                                      class="search-tag-list"/>
              <ej-search-input v-model="tagKeywords"
                               width="130"
                               height="30"
                               placeholder="输入标签名"
                               style="height: 30px; top: 5px; left: 75px"
                               class="absolute"
                               @keyup.enter="handleTagSearch"
                               @search="handleTagSearch"/>
            </div>
          </template>
      </ej-search-list>
    </div>
    <div class="search-layout-content">
      <!-- Tab内置内容 -->
      <div class="search-layout-content__inside">
        <div class="ml-6 text-gray">共{{tableList.pageTotal || 0}}条检索数据</div>
        <!-- 共用块 -->
        <slot :data="tableList.data"/>
        <common-pagination  background
                            :current-page="currentPage"
                            :page-size="tableList.pageSize"
                            :total="tableList.pageTotal"
                            @current-change="handleCurrentChange"/>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import _ from 'lodash'
  import {Button, Input, Tabs, TabPane} from 'element-ui'

  import {Icon,
          SearchList as EjSearchList,
          SearchOptionList as EjSearchOptionList,
          SearchOptionCascader as EjSearchOptionCascader,
          SearchOptionSelect as EjSearchOptionSelect,
          SearchInput as EjSearchInput} from '@ej/ui'

  import CommonPagination from '@/common-components/pagination'

  Vue.use(Button)
  Vue.use(Input)
  Vue.use(Tabs)
  Vue.use(TabPane)

  Vue.use(Icon)

  Vue.use(CommonPagination)

  export default {
    name: 'CommonSearch',

    components: {
      EjSearchList,
      EjSearchOptionList,
      EjSearchOptionSelect,
      EjSearchOptionCascader,
      EjSearchInput,
    },

    props: {
      searchWord: String,
      tableList: Object,
      pageNumber: {
        type: Number,
        default: 1,
      },
      viewId: {
        type: Number,
        default: 1,
      },
      filter: {
        type: Array,
        default: () => [],
      },
      techShow: {
        type: Boolean,
        default: true,
      },
      busiShow: {
        type: Boolean,
        default: true,
      },
      tagList: {
        type: Array,
        default: () => [],
      },
    },

    model: {
      prop: 'pageNumber',
      event: 'current-change',
    },

    data () {
      return {
        tagKeywords: '',
        models: {
          system_path_tech: [],
          system_path_busi: [],
          filter: [],
          label_name: [],
        },
        modelsKeyword: this.searchWord,
        datas: [
          {
            key: 'system_path_tech',
            label: '技术类目',
            options: [],
          },
          {
            key: 'system_path_busi',
            label: '业务类目',
            options: [],
          },
          {
            key: 'filter',
            label: '过滤条件',
            options: [],
          },
          {
            key: 'label_name',
            label: '标签名称',
            options: [],
          },
        ],
      }
    },

    computed: {
      currentPage: {
        get () {
          return this.pageNumber
        },
        set (val) {
          this.$emit('current-change', val)
        },
      },
    },

    watch: {
      techShow (val) {
        if (!val) {
          this.models.system_path_tech = []
        }
      },

      busiShow (val) {
        if (!val) {
          this.models.system_path_busi = []
        }
      },
      '$route.query': {
        immediate: true,
        handler ({categoryType, categoryId}) {
          if (this.techShow || this.busiShow) {
            if (this.$route.query.categoryType === 'tech') {
              this.models.system_path_tech = [...categoryId]
            } else if (this.$route.query.categoryType === 'busi') {
              this.models.system_path_busi = [...categoryId]
            }
          }
        },
      },
      tagList: {
        immediate: true,
        handler (val) {
          this.datas.map((d, index) => {
            if (d.key === 'label_name') {
              this.$set(this.datas[index], 'options', val)
            }
          })
        },
      },
    },

    created () {
      this.datas.map((d, index) => {
        if (d.key === 'filter') {
          this.$set(this.datas[index], 'options', this.filter)
        }
      })
    },

    methods: {
      emitSetSelected (...args) {
        return this.$refs.ejSearchList.emitSetSelected(...args)
      },
      handleSearch: _.debounce(function (type) {
        this.$emit('search', type, type === 'btn' ? this.modelsKeyword : this.models)
      }, 300),
      handleCurrentChange (val) {
        this.currentPage = val
      },
      handleTagSearch () {
        let originalData = _.cloneDeep(this.tagList).filter(od => od)

        let filterArr = originalData.filter(dr => {
          if (!this.tagKeywords || dr.label.includes(this.tagKeywords)) {
            return dr
          }
        })
        this.datas.map((d, index) => {
          if (d.key === 'label_name') {
            this.$set(this.datas[index], 'options', filterArr.length > 0 ? filterArr : ['--'])
          }
        })
      },
    },
  }
</script>

<style lang="scss">
  .search-layout {

    .el-tabs__header {
      margin: 0;
    }

    .el-breadcrumb .el-breadcrumb__separator {
      margin: 0 5px;
      font-weight: normal;
      @apply text-gray;
    }

    .el-tabs__nav {
      margin-left: 50px;
    }

    .input-search .el-input__inner {
      border-radius: 50px;
      @apply text-lg text-black;
    }

    &-content {
      .el-tabs__item {
        width: 110px;
        text-align: center;
        @apply text-lg text-black;
      }
      .el-tabs__item.is-active {
        @apply text-blue;
      }
      .el-tabs__nav-wrap::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        z-index: 1;
        @apply bg-gray-light;
      }
    }

    .search-layout-header {
      margin: 0 24px;
      .search-content-input {
        width: 522px !important;
        height: 38px !important;
      }
    }

    &-header {
      .search-btn {
        width: 20px;
        height: 20px;
        margin-top: 50%;
        transform: translateX(-50%);
      }
    }

    button {
      outline: none;
    }

    .el-pagination {
      text-align: right;
    }

    .search-layout-content {
      position: relative;
      margin-top: 15px;
    }

    .search-layout-content__inside {
      margin-top: 12px;
    }
    .search-tag-list {
      .ej-conditions-list:first-of-type {
        margin-left: 140px;
      }
    }
  }
</style>
