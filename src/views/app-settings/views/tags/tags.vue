<template>
  <div class="tags-view">
    <section class="left p-4">
      <header class="clearfix">
        <h2 class="clearfix mb-2">
          <div class="float-left text-lg text-gray-darkest font-semibold">标签管理</div>
        </h2>
        <ej-search-input v-model="labelKeywords" width="100%" height="36" placeholder="请输入检索内容" @search="handleSearchLabel"/>
        <el-button type="text" class="float-right text-xs text-blue pt-1" @click="handleSearchLabel(null)">全部清空</el-button>
      </header>

      <div class="left-main mt-4">
        <div v-for="(item, idx) of tagTypeList" :key="idx" class="label-type-wrap">
          <!-- 标签类型标题 -->
          <h3 class="clearfix mt-4 mb-2">
            <div class="float-left text-base text-gray-darker">{{item.tagCategoryName}}</div>
          </h3>
          <!-- 标签类型内容 -->
          <div>
            <div v-for="(tag, idx) of item.results" :key="idx" class="tag-item inline-block">
              <div class="relative">
                <tag-comp :name="tag.tagName + '(' + tag.useCount + ')'"
                          @click.native="handleClickTags(tag, item)"/>
                <el-checkbox  v-if="isCorrelationView"
                              v-model="checkedTagKeys"
                              :label="tag.id"
                              class="tag-item-checkbox"
                              @change="handleCheckTagChange(tag, item)"/>
                <i v-if="!isCorrelationView" class="tag-item-remove hidden el-icon-circle-close" @click.stop="handleRemoveTypeTag(tag, item)"></i>
              </div>
            </div>
            <!-- 增加标签 -->
            <div v-show="!isCorrelationView" class="tag-add-wrap inline-block relative">
              <el-link :underline="false" title="增加标签" @click="createTagVisible = !createTagVisible, currentTagCategoryId = item.tagCategoryId"><i class="el-icon-plus inline-block p-1"></i></el-link>
              <create-tag :visible="createTagVisible && currentTagCategoryId === item.tagCategoryId"
                          :tag-category-id="item.tagCategoryId"
                          :errorTip="createTagErrorTip"
                          @change-visible="createTagVisible = false; createTagErrorTip = ''"
                          @add-tag="handleAddTag"/>
            </div>
          </div>
        </div>

        <div v-if="!tagTypeList.length" class="text-gray text-center">暂无标签数据</div>
      </div>
    </section>

    <section class="right">
      <settings-layout layout="COMPOUND"
                     search-input-width="200"
                     search-input-height="34"
                     :data-type-list="platformList"
                     :is-show-condition="isCorrelationView"
                     @search="handleSearch">
        <template #buttonArea>
          <el-button :disabled="!isCorrelationView" type="primary" plain :class="{disabledActive: !isCorrelationView}" @click="handleCreateCorrelation">新建关联</el-button>
          <el-button :disabled="!isCorrelationView" type="primary" plain :class="{disabledActive: !isCorrelationView}" @click="handleRemoveCorrelation">取消关联</el-button>
        </template>

        <template #mainArea>
          <div class="tag-search">
            <h2 class="tag-search-title inline-block font-semibold">标签：</h2>
            <el-button type="text" icon="el-icon-delete" :disabled="isCorrelationView" size="mini" round class="tag-search-remove inline-block" @click="handleRemoveSearchTag(null, 'all')">无标签</el-button>
            <el-tag v-for="(tag, idx) in searchTags" :key="idx" :closable="!isCorrelationView" :class="[!isCorrelationView ? '' : 'tag-search-item']" @close="handleRemoveSearchTag(tag, 'one')">{{tag.tagName}}</el-tag>
          </div>
          <el-table v-ej-loading="$apollo.queries.objectList.loading"
                    ref="multipleTable"
                    :data="objectList"
                    tooltip-effect="dark"
                    style="width: 600px"
                    @selection-change="handleTableSelectionChange">
            <el-table-column type="expand" width="18">
              <template slot-scope="scope">
                <div v-if="scope.row.tags.length > 0">
                  <el-tag v-for="tag in scope.row.tags" :key="tag.name">
                    {{tag.name}}
                    <i v-show="!isCorrelationView" class="el-icon-circle-close absolute" @click="handleRemoveTag(tag, scope.row)"></i>
                  </el-tag>
                </div>
                <div v-else class="text-center text-gray">
                  暂无标签数据
                </div>
              </template>
            </el-table-column>
            <el-table-column type="selection" width="44"/>
            <el-table-column prop="belongApp" label="平台名称" width="120"/>
            <el-table-column prop="belongSystem" label="系统名称"/>
            <el-table-column prop="dataBaseName" label="数据库名称"/>
            <el-table-column prop="chineseName" label="表中文名"/>
            <el-table-column prop="name" label="表英文名">
              <template slot-scope="scope">
                <ComTooltip :text="scope.row.name"><span>{{scope.row.name}}</span></ComTooltip>
              </template>
            </el-table-column>
            <el-table-column label="标签数" width="70" fixed="right">
              <template slot-scope="scope">{{ scope.row.tags ? scope.row.tags.length : 0 }}</template>
            </el-table-column>
          </el-table>

          <common-pagination  background
                              :current-page.sync="currentPage"
                              :page-size="pagination.size"
                              :total="pagination.total"
                              @current-change="handleCurrentChange"/>
        </template>

      </settings-layout>
    </section>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {mapGetters} from 'vuex'
  import _ from 'lodash'
  import {
    Button as ElButton,
    Link as ElLink,
    Table as ElTable,
    TableColumn as ElTableColumn,
    Tag as ElTag,
    Checkbox as ElCheckbox,
  } from 'element-ui'

  import {SearchInput, Loading} from '@ej/ui'

  import QUERY_MDS_LIST from '@/graphql/settings_manage_mds_list.gql'
  import MUTATION_TAG_MDS_REMOVE from '@/graphql/tag-remove.gql'
  import QUERY_TAG_TYPE_LIST from '@/graphql/tag_type_list.gql'
  import MUTATION_TAG_MANAGE_REMOVE from '@/graphql/tag_manage_remove.gql'
  import MUTATION_TAG_TYPE_ADD from '@/graphql/tag_type_add_tag.gql'
  import MUTATION_ADD_MDS_TO_TAG from '@/graphql/tag_manage_add_mds_to_tag.gql'
  import MUTATION_REMOVE_MDS_TO_TAG from '@/graphql/tag_manage_remove_mds_to_tag.gql'
  import Message from '@/utils/message'
  import CreateTag from './tag-add'
  import TagComp from './tag-comp'
  import SettingsLayout from '@/components/settings-layout'
  import CommonPagination from '@/common-components/pagination'
  import ComTooltip from '@/common-components/tooltip'

  Vue.use(SearchInput)
  Vue.use(Loading)
  Vue.use(ComTooltip)

  // 新建关联confirm文案
  const TAG_CATALOG_CREATE_CONFIRM = {
    message: '即将创建表与标签的关联关系, 是否继续?',
    messageSuccessText: '操作成功',
    messageErrorText: '已取消操作',
  }

  // 取消关联confirm文案
  const TAG_CATALOG_CANCEL_CONFIRM = {
    message: '即将取消表与标签的关联关系, 是否继续?',
    messageSuccessText: '操作成功',
    messageErrorText: '已取消操作',
  }

  // 删除标签confirm文案
  const TAG_REMOVR_CONFIRM = {
    message: '即将删除标签, 是否继续?',
    messageSuccessText: '操作成功',
    messageErrorText: '已取消操作',
  }

  export default {
    name: 'TagsView',

    components: {
      ElButton,
      ElLink,
      ElTable,
      ElTableColumn,
      ElTag,
      ElCheckbox,

      CreateTag,
      SettingsLayout,
      CommonPagination,
      TagComp,
    },

    data () {
      return {
        labelKeywords: '', // 左侧标签搜索

        tagTypeList: [], // 标签分类展示数据
        tagOriginalTypeList: [], // 标签分类原始数据

        createTagVisible: false, // 添加标签框
        createTagErrorTip: '', // 添加标签-错误提示

        currentTagCategoryId: '', // 当前选中的标签分类Id

        platformList: [], // 平台搜索条件列表

        isCorrelationView: false, // 是否隐藏筛选条件

        multipleSelection: [], // 标签表格复选框选择

        // objectList: [], // mdsObject列表

        checkedTagKeys: [], // 关联视图下，左侧标签被选中的列表

        searchTags: [], // 搜索视图下，左侧标签被点击的列表

        searchKeyword: '', // 搜索视图下，右侧搜索框的值

        searchSelectVal: '', // 搜索视图下，右侧级联框的值

        isLoading: false,

        pagination: { // 分页信息
          offset: 0,
          size: 10,
          total: 0,
        },
        currentPage: 1,
      }
    },

    apollo: {
      tagTypeListQuery: {
        query: QUERY_TAG_TYPE_LIST,
        fetchPolicy: 'no-cache',
        variables: {
          input: {
            appKey: 'MDS',
          },
        },
        update (data) {
          const _data = data.tagTypeList
          if (_data && _data.length > 0) {
            this.tagOriginalTypeList = this.tagTypeList = _data
          }
          return _data
        },
      },
      objectList: {
        query: QUERY_MDS_LIST,
        fetchPolicy: 'network-only',
        variables () {
          return {
            input: {
              techCategoryId: this.searchSelectVal,
              keyword: this.searchKeyword,
              labelIds: this.searchTags.length > 0 ? this.searchTags.map(s => s.id) : [],
              offset: this.pagination.offset,
              size: this.pagination.size,
            },
          }
        },
        update (data) {
          this.pagination.total = data.mdsLists.total
          return data.mdsLists.data
        },
      },
    },

    computed: {
      ...mapGetters({
        techTree: 'techTree',
      }),
    },

    created () {
      this.platformList = this.techTree
    },

    methods: {
      /**
       * 标签搜索
       */
      handleSearchLabel (args) {
        if (!args) {
          this.labelKeywords = ''
        }
        let keyword = args
        if (this.tagOriginalTypeList) {
          let originalData = _.cloneDeep(this.tagOriginalTypeList).filter(t => t)
          this.tagTypeList = originalData.filter(data => {
            const drObj = data.results.filter(dr => dr.tagName.includes(keyword))

            if (!args || data.tagCategoryName.includes(keyword) || drObj.length > 0) {
              if (drObj.length > 0) {
                data.results = drObj
              } else if (args) {
                data.results = []
              }
              return data
            }
          })
        } else {
          this.tagTypeList = []
        }
      },

      /**
       * 添加标签
       */
      async handleAddTag (tag, e) {
        const hasTag = this.tagOriginalTypeList.find(t => t.results.find(r => r.tagName === tag.tagName))
        if (hasTag) {
          this.createTagErrorTip = '标签已经存在'
          return
        }

        this.createTagErrorTip = ''
        if (e.key === 'Enter') {
          // 保存标签
          if (!tag.tagName) {
            this.createTagVisible = false
            return
          }

          const {data: {createTag}} = await this.$apollo.mutate({
            mutation: MUTATION_TAG_TYPE_ADD,
            variables: {
              input: {
                tagName: tag.tagName,
                tagCategoryId: tag.tagCategoryId,
                appKey: 'MDS',
              },
            },
          })

          await this.$apollo.queries.tagTypeListQuery.refresh()
          await this.$apollo.queries.objectList.refresh()

          if (createTag) {
            Message.MessageSuccess({messageSuccessText: '操作成功'})
            this.createTagVisible = false
            this.currentTagCategoryId = ''
          }
        }
      },

      /**
       * 表 搜索
       */
      handleSearch (arg) {
        const techSelectList = arg.select
        this.searchKeyword = arg.keywords
        this.searchSelectVal = techSelectList.length > 0 ? techSelectList[techSelectList.length - 1] : ''
        if (this.searchSelectVal || this.searchKeyword) {
          this.searchTags = []
        }
        // 搜索时，重置页码
        this.pagination.offset = 0
        this.currentPage = 1
      },

      /**
       * 新建关联
       */
      handleCreateCorrelation () {
        if (this.multipleSelection.length === 0) {
          Message.MessageError({messageErrorText: '请选择要关联的表'})
          return
        }
        if (this.checkedTagKeys.length === 0) {
          Message.MessageError({messageErrorText: '请选择要关联的标签'})
          return
        }
        Message.MessageBoxConfirm(
          TAG_CATALOG_CREATE_CONFIRM,
          async () => {
            // 建立关联关系
            await this.$apollo.mutate({
              mutation: MUTATION_ADD_MDS_TO_TAG,
              variables: {
                tagIds: this.checkedTagKeys,
                mdsIds: this.multipleSelection.map(m => m.id),
              },
            }).then(({data: {addMdsToTag}}) => {
              if (addMdsToTag) {
                this.resetView()
                // 搜索时，重置页码
                this.pagination.offset = 0
                this.currentPage = 1
                // 刷新分类列表
                this.$apollo.queries.tagTypeListQuery.refresh()
                this.$apollo.queries.objectList.refresh()
              } else {
                throw new Error()
              }
            }).catch((error) => {
              if (error.message && error.message.split(':')[1]) {
                throw error.message.split(':')[1]
              } else {
                throw new Error()
              }
            })
          })
      },

      /**
       * 取消关联
       */
      handleRemoveCorrelation () {
        if (this.multipleSelection.length === 0) {
          Message.MessageError({messageErrorText: '请选择要取消关联的表'})
          return
        }
        if (this.checkedTagKeys.length === 0) {
          Message.MessageError({messageErrorText: '请选择要取消关联的标签'})
          return
        }

        Message.MessageBoxConfirm(
          TAG_CATALOG_CANCEL_CONFIRM,
          async () => {
            // 取消关联关系
            await this.$apollo.mutate({
              mutation: MUTATION_REMOVE_MDS_TO_TAG,
              variables: {
                tagIds: this.checkedTagKeys,
                mdsIds: this.multipleSelection.map(m => m.id),
              },
            }).then(({data: {removeMdsToTag}}) => {
              if (removeMdsToTag) {
                this.resetView()
                // 搜索时，重置页码
                this.pagination.offset = 0
                this.currentPage = 1
                // 刷新分类列表
                this.$apollo.queries.tagTypeListQuery.refresh()
                this.$apollo.queries.objectList.refresh()
              } else {
                throw new Error()
              }
            }).catch((error) => {
              if (error.message && error.message.split(':')[1]) {
                throw error.message.split(':')[1]
              } else {
                throw new Error()
              }
            })
          })
      },

      /**
       * 表格复选框 点击时触发
       */
      handleTableSelectionChange (selection) {
        this.multipleSelection = selection

        if (selection.length > 0) {
          this.isCorrelationView = true
        } else {
          this.isCorrelationView = false

          this.checkedTagKeys = []
        }
      },

      /**
       * 删除标签
       */
      handleRemoveTag (tag, item) {
        // 发送删除请求
        Message.MessageBoxConfirm(
          TAG_REMOVR_CONFIRM,
          async () => {
            const {data: {removeTag}} = await this.$apollo.mutate({
              mutation: MUTATION_TAG_MDS_REMOVE,
              variables: {
                mdsObjectId: item.id,
                tagId: tag.id,
              },
            })

            if (removeTag) { // 如果接口删除成功，前端删除标签，不刷新列表数据
              this.objectList.map(obj => {
                if (obj.id === item.id) {
                  obj.tags = obj.tags.filter(t => t.id !== tag.id)
                }
                return obj
              })
              await this.$apollo.queries.tagTypeListQuery.refresh()
            }
          })
      },

      /**
       * 关联视图下，左侧标签勾选时触发
       */
      handleCheckTagChange (tag, item) {
        console.log('关联视图下tag，左侧标签勾选时触发', tag, item)
      },

      /**
       * 切换视图时 重置
       */
      resetView () {
        this.isCorrelationView = false
        this.$refs.multipleTable.clearSelection()
        this.checkedTagKeys = []
      },

      /**
       * 删除分类中的标签
       */
      handleRemoveTypeTag (tag, item) {
        Message.MessageBoxConfirm(
          TAG_REMOVR_CONFIRM,
          async () => {
            const {data: {removeTag}} = await this.$apollo.mutate({
              mutation: MUTATION_TAG_MANAGE_REMOVE,
              variables: {
                input: [tag.id],
              },
            })

            if (removeTag) { // 如果接口删除成功，前端删除标签，不刷新列表数据
              this.tagTypeList = this.tagOriginalTypeList.map(obj => {
                if (obj.id === item.id) {
                  obj.results = obj.results.filter(t => {
                    if (t.id === tag.id) {
                      this.removeSearchTags(tag)
                    } else {
                      return t
                    }
                  })
                }
                return obj
              })
            }
          })
      },

      /**
       * 标签作为搜索条件时，点击时触发
       */
      handleClickTags (tag, item) {
        // this.isCorrelationView 值为`false` 代表搜索视图
        if (!this.isCorrelationView) {
          const _isExistd = this.searchTags.find(s => s.id === tag.id)
          if (!_isExistd) {
            this.searchTags.push(tag)

            // 搜索时，重置页码
            this.pagination.offset = 0
            this.currentPage = 1
          }
        }
      },

      /**
       * 删除 搜索条件上的标签
       */
      handleRemoveSearchTag (tag, type) {
        if (!this.isCorrelationView) {
          if (type === 'one') {
            this.removeSearchTags(tag)
          } else if (type === 'all' && this.searchTags.length !== 0) {
            this.searchTags = []
          }
          // 搜索时，重置页码
          this.pagination.offset = 0
          this.currentPage = 1
        }
      },

      /**
       * 重置搜索标签
       * 此方法使用时机：当用户点击左侧`删除分类` or `删除标签` or `删除搜索栏上的标签`
       */
      removeSearchTags (tag) {
        this.searchTags = this.searchTags.filter(s => s.id !== tag.id)
      },

      /**
       * 点击分页时触发
       */
      handleCurrentChange (page) {
        this.pagination.offset = (page - 1) * this.pagination.size
      },
    },
  }
</script>

<style lang="scss">
  .tags-view {
    @apply flex;

    > section {
      @apply bg-white;
    }

    > .left {
      @apply flex-none;

      width: 270px;
      margin-right: 2px;
      .label-btn {
        margin-top: -3px;
      }

      .el-button--primary.is-plain {
        color: theme('colors.blue.default');
        background: theme('colors.blue.lighter');
        border: none;
      }
      .tag-item {
        .tag-item-remove {
          @apply bg-white absolute text-blue font-bold rounded-full;
        }
        &:hover {
          .tag-item-remove {
            @apply inline-block cursor-pointer;

            top: -4px;
            right: -4px;
            z-index: 20;
          }
        }
        .tag-item-checkbox {
          @apply absolute;

          top: -8px;
          right: -8px;
          z-index: 20;

          .el-checkbox__label {
            display: none;
          }
        }
      }
      .left-main {
        .tag-add-wrap {
          .el-link {
            .el-link--inner {
              margin-bottom: 14px;
            }
            .el-icon-plus {
              @apply text-blue font-bold;
            }
          }
          .tag-add-block {
            @apply w-full bg-white;

            height: 100px;
          }
        }

        .el-checkbox__input.is-checked .el-checkbox__inner {
          @apply bg-blue border-blue;
        }
      }
    }

    > .right {
      @apply flex-1 p-4;

      .buttons {
        .disabledActive {
          @apply text-white bg-gray-light;

          &:hover,
          &:focus {
            @apply text-white bg-gray-light #{!important};
          }
        }
      }
      .tag-search {
        .tag-search-btn, .tag-search-title {
          margin: 10px 0px;
        }
        .tag-search-item {
          @apply text-gray-dark bg-gray-light cursor-not-allowed;
        }
        .tag-search-remove [class*=el-icon-]+span {
          margin-left: 0 !important;
        }
      }
      .el-tag {
        @apply mx-1 relative text-black bg-blue-lighter;

        height: 28px;
        line-height: 28px;
        margin: 7px 7px;
        padding: 0 6px;
        border: none;

        .el-icon-circle-close {
          @apply bg-white text-blue rounded-full text-lg font-medium;
          top: -7px;
          right: -7px;

          &:hover {
            @apply cursor-pointer;
          }
        }
      }
      .el-table__expanded-cell {
        @apply bg-gray-lightest #{!important};
      }
      .app-pagination {
        @apply my-6 text-right;
      }
    }
  }
</style>
