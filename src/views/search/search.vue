<template>
  <div class="bg-white search-view">
    <search-layout v-if="filter"
                   :key="$route.query.s"
                   :searchWord="$route.query.s"
                   :table-list="searchResults"
                   :view-id="6070"
                   v-model="pageNumber"
                   :filter="filter"
                   :tag-list="tagList"
                   :tech-show="isTechShow"
                   :busi-show="isBusiShow"
                   @search="handleSearch"
                   @current-change="handleCurrentPage">
      <!-- 结果列表 -->
      <template #default="{data}">
        <ul class="result-list" v-ej-loading="searchLoading">
          <li v-for="(item, idx) in data" :key="idx" class="py-2 px-6 mx-1">
            <div class="flex items-center">
              <router-link :to="{name: 'detail', params: {dataId: item.id}}"
                           class="title text-lg text-theme-color flex-none flex items-center">
                <p v-html="handleHtmlFilter(item.chineseName ? item.name + '(' + item.chineseName + ')' : item.name)"></p>

                <span v-if="item.MdsObjectTypeEnum === 'TABLE'" class="icon-table">
                  <ej-icon icon="table-file" class="inline-block ml-4 table-file"/>
                </span>
                <span v-else-if="item.MdsObjectTypeEnum === 'FILE'" class="icon-file icon-excel">excel</span>
                <span v-else-if="item.MdsObjectTypeEnum === 'INTERFACE'" class="icon-file icon-interface">接口</span>

                <span v-if="item.isFire" class="text-red flex items-center">
                  <ej-icon icon="fire" class="inline-block ml-4 fire"/>
                </span>

                <span class="high-quality text-sm px-2 ml-4 rounded bg-blue-lighter">高质量</span>

              </router-link>
              <span class="looks-num text-gray-darker ml-auto">浏览数：{{item.pv}}</span>
            </div>
            <p class="truncate result-desc text-gray-dark">描述：<span v-html="handleHtmlFilter(item.description)"></span></p>
            <el-row type="flex">
              <el-col>所属系统：{{item.belongSystem}}</el-col>
              <el-col>资产等级：{{item.assetsLevel}}</el-col>
              <el-col>安全等级：{{item.d4aSafetyRank}}</el-col>
              <el-col>业务负责人：{{item.busiLinkman ? item.busiLinkman.name: ''}}</el-col>
              <el-col>技术负责人：{{item.techLinkman ? item.techLinkman.name: ''}}</el-col>
            </el-row>
          </li>
        </ul>
      </template>
    </search-layout>
  </div>
</template>

<script>
  import Vue from 'vue'
  import xss from 'xss'
  import {Col as ElCol, Row as ElRow} from 'element-ui'

  import {Icon, Loading} from '@ej/ui'

  import QUERY_SEARCH_FILTER from '@/graphql/search_filter_choose.gql'
  import QUERY_SEARCH_DATA from '@/graphql/search_category.gql'
  import QUERY_SEARCH_TAG_ALL_LIST_DATA from '@/graphql/search_tag_all_list.gql'
  import SearchLayout from '@/components/search-layout.vue'

  Vue.use(Icon)
  Vue.use(Loading)

  export default {
    name: 'SearchView',

    components: {
      SearchLayout,
      ElRow,
      ElCol,
    },

    data () {
      return {
        searchResults: {},
        searchParams: {
          // 通过name chineseName description 进行查询
          keyword: String,
          // 通过技术类目Id查询
          techCategoryId: null,
          // 通过业务类目Id查询
          busiCategoryIds: null,
          // mdsobject type: 表/接口/文件
          mdsObjectType: 'TABLE',
          // 通过标签Id进行搜索
          labelIds: null,

          // 数据期限
          dataLife: '',
          // 资产等级
          assetsLevel: '',
          // 安全等级
          d4aSafetyRank: '',

          offset: 0, // 偏移量
          size: 10, // 分页数
        },
        pageNumber: 1, // 第几页

        isTechShow: true, // 是否显示技术类目
        isBusiShow: true, // 是否显示业务类目

        searchLoading: false,
      }
    },

    watch: {
      '$route.query.s': {
        handler () {
          if (this.$route.query.s) {
            this.searchParams.keyword = this.$route.query.s
            this.sendSearch()
          }
        },
      },
      // '$route.query': {
      //   immediate: true,
      //   handler ({categoryType}) {
      //     if (categoryType === 'tech') {
      //       this.isTechShow = true
      //       this.isBusiShow = false
      //     } else if (categoryType === 'busi') {
      //       this.isTechShow = false
      //       this.isBusiShow = true
      //     } else {
      //       this.isTechShow = true
      //       this.isBusiShow = true
      //     }
      //   },
      // },
    },

    apollo: {
      filter: {
        query: QUERY_SEARCH_FILTER,
        update (data) {
          let _filter = data.filter
          // 搜索条件中 mdsObjType对应的是枚举类型， value = label
          let _mdsObjType = _filter.mdsObjType.map(m => {
            return {
              value: m.label,
              lable: m.label,
            }
          })
          let filterArr = [_filter.dataLife, _filter.assetsLevel, _filter.d4aSafetyRank, _mdsObjType]

          return filterArr
        },
      },

      tagList: {
        query: QUERY_SEARCH_TAG_ALL_LIST_DATA,
        update (data) {
          return data.tagSelectAll
        },
      },
    },

    created () {
      if (this.$route.query.s) {
        this.searchParams.keyword = this.$route.query.s
        this.sendSearch()
      }
    },

    methods: {
      handleHtmlFilter (flagment) {
        return xss(flagment, {
          onIgnoreTag: function (tag, html, options) {
            if (tag.substr(0, 2) === 'x-') {
              return html
            }
          },
        })
      },

      handleCurrentPage (page) {
        this.searchParams.offset = (page - 1) * this.searchParams.size
        this.sendSearch(true)
      },

      handleSearch (type, arg) {
        if (type === 'btn') {
          this.searchParams.keyword = arg
        } else if (type === 'hot') {
          this.searchParams.dataLife = arg.filter[0] || null // 租户名称(tenantId)
          this.searchParams.assetsLevel = arg.filter[1] || null // 所属应用
          this.searchParams.d4aSafetyRank = arg.filter[2] || null // 所属系统
          this.searchParams.mdsObjectType = arg.filter[3] || null // 所在资源
          // 通过技术类目Id查询
          this.searchParams.techCategoryId = arg.system_path_tech.length > 0 ? arg.system_path_tech[arg.system_path_tech.length - 1] : null
          // 通过业务类目Id查询
          this.searchParams.busiCategoryIds = arg.system_path_busi.length > 0 ? arg.system_path_busi[arg.system_path_busi.length - 1] : null
          // 通过标签Id进行搜索
          this.searchParams.labelIds = arg.label_name.length > 0 ? [...arg.label_name] : null
        }
        this.sendSearch()
      },

      /**
       * 搜索接口
       * @param [isPaging] {Boolean} - 是否是分页查询，true标记为分页查询
       */
      async sendSearch (isPaging) {
        this.searchLoading = true

        // 非 分页 查询, 将页码重置为1 偏移量重置为0
        if (!isPaging) {
          this.searchParams.offset = 0
          this.pageNumber = 1
        }

        const respData = await this.$apollo.query({
          query: QUERY_SEARCH_DATA,
          fetchPolicy: 'network-only',
          variables: {
            input: {...this.searchParams},
          },
        })
        this.searchLoading = false
        this.searchResults = respData.data.search
      },
    },
  }
</script>

<style lang="css">
  .title em, .result-desc em {
    color: #EC7272;
  }
</style>

<style lang="scss">
  .search-view {
    min-width: 1100px;
    padding: 20px 0;

    .el-checkbox__input.is-checked .el-checkbox__inner,
    .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      @apply bg-blue border-blue #{!important};
    }
    .el-checkbox__input.is-checked+.el-checkbox__label {
      color: theme('colors.blue.default') !important;
    }

    .el-tabs__active-bar {
      background-color: theme('colors.blue.default');
    }

    .common-icon {
      display: inline-block;
      margin-left: 10px;
    }

    .table-file {
      width: 15px;
      height: 16px;
    }

    .fire {
      width: 15px;
      height: 17px;
    }

    .high-quality {
      margin-top: 1px;
    }

    .result-desc {
      line-height: 20px;
      margin: 8px auto 5px;
    }

    .result-list {
      min-height: 300px;
      li {
        margin-bottom: 20px;
        &:hover {
          @apply rounded;

          transition: .3s;
          box-shadow: 0px 1px 8px 2px rgba(140, 171, 232, 0.3);
        }
      }

      .el-col {
        line-height: 20px;
      }

      .title {
        @apply text-lg text-theme-color;

        line-height: 22px;
        font-weight: normal;

        p {
          margin: 0 8px 0 0;
        }

        .icon-file {
          @apply text-sm text-green-light border border-green-light;

          padding: 1px 4px;
          border-radius: 3px;
          line-height: 16px;
        }
      }

      .looks-num {
        line-height: 22px;
      }
    }
  }
</style>
