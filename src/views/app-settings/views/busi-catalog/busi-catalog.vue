<template>
  <div class="busi-catalog-view">
    <section class="left p-4">

      <ej-search-input v-model="treeKeywords"
                       width="100%"
                       height="34"
                       placeholder="请输入"
                       @search="handleTreesearch"/>

      <div class="buttons">
        <el-button :disabled="isCorrelationView" type="primary" plain class="mt-4" @click="handleTreeCreateNode('FOLDER')">新建文件夹</el-button>
        <el-button :disabled="isCorrelationView" type="primary" plain class="mt-4" @click="handleTreeCreateNode('FILE')">新建目录</el-button>
      </div>
      <menu-tree ref="tree"
                 :data="tree"
                 :show-checkbox="isCorrelationView"
                 :filter-node-method="filterNode"
                 node-key="id"
                 :default-expanded-keys="defaultExpandedKeys"
                 :expand-on-click-node="false"
                 :props="{children: 'children', label: 'name'}"
                 class="filter-tree mt-6"
                 @check="handleCheck">
        <span class="ml-2 tree-catalog-wrap clearfix" slot-scope="{node, data}">
          <span @click="handleNodeClick(data)"><i v-if="!data.children" :class="['text-blue', data.busiLevelType === createNodeType.file ? 'el-icon-document' : 'el-icon-folder']"></i>{{node.label}}</span>
          <div v-show="!isCorrelationView" class="tree-opera-wrap z-50">
            <ComTooltip text="上移">
              <span v-if="node.previousSibling" @click="() => nodeMoveUp(node, data)"><i class="el-icon-top"></i></span>
            </ComTooltip>
            <ComTooltip text="下移">
              <span v-if="node.nextSibling" @click="() => nodeMoveDown(node, data)"><i class="el-icon-bottom"></i></span>
            </ComTooltip>
            <ComTooltip text="新建分类">
              <span v-if="data.busiLevelType === createNodeType.folder" @click="() => handleTreeCreateNode('FOLDER', data)"><i class="el-icon-folder-opened"></i></span>
            </ComTooltip>
            <ComTooltip text="新建类目">
              <span v-if="data.busiLevelType === createNodeType.folder" @click="() => handleTreeCreateNode('FILE', data)"><i class="el-icon-plus"></i></span>
            </ComTooltip>
            <ComTooltip text="删除">
              <span @click="() => nodeRemove(node)"><i class="el-icon-delete"></i></span>
            </ComTooltip>
          </div>
        </span>
      </menu-tree>
    </section>

    <section class="right">
      <settings-layout layout="UPGRADE"
                     search-input-width="200"
                     search-input-height="34"
                     :data-type-list="dataTypeList"
                     :viewId="1013"
                     :is-show-condition="isCorrelationView"
                     v-model="searchSelectedBusi"
                     @search="handleSearch">
        <template #buttonArea>
          <el-button :disabled="!isCorrelationView" type="primary" plain :class="{disabledActive: !isCorrelationView}" @click="handleCreateCorrelation">新建关联</el-button>
          <el-button :disabled="!isCorrelationView" type="primary" plain :class="{disabledActive: !isCorrelationView}" @click="handleRemoveCorrelation">取消关联</el-button>
        </template>

        <template #mainArea>
          <el-table v-ej-loading="isLoading"
                    ref="multipleTable"
                    :data="busiCatalogList"
                    tooltip-effect="dark"
                    style="width: 510px"
                    @selection-change="handleTableSelectionChange">
            <el-table-column type="selection" width="48"/>
            <el-table-column label="排序" type="index" width="50">
              <template slot-scope="scope">{{ scope.$index + pagination.offset + 1 }}</template>
            </el-table-column>
            <el-table-column label="对象名称">
              <template slot-scope="scope">
                <ComTooltip :text="cnAndEn(scope.row)"><span>{{ scope.row.name }}</span></ComTooltip>
              </template>
            </el-table-column>
            <el-table-column prop="belongApp" label="平台名称">
              <template slot-scope="scope">
                <ComTooltip :text="scope.row.belongApp"><span>{{ scope.row.belongApp }}</span></ComTooltip>
              </template>
            </el-table-column>
            <el-table-column prop="belongSystem" label="系统名称" width="100"/>
            <el-table-column prop="dataBaseName" label="数据库名称" fixed="right" width="100">
              <template slot-scope="scope">
                <ComTooltip :text="scope.row.dataBaseName"><span>{{ scope.row.dataBaseName }}</span></ComTooltip>
              </template>
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

    <!-- 新建Tree节点Dialog -->
    <el-dialog :visible.sync="createNodeDialogFormVisible">
      <template #title>
        <h3 class="text-center font-semibold text-2xl">{{createNodeDialogTitle}}</h3>
      </template>

      <el-form ref="createNodeForm" :model="createNodeForm" class="create-node-dialog">
        <el-form-item label="上级文件夹" :label-width="formLabelWidth" class="previous-sibling-id">
          <div style="margin-top: 20px;" class="font-semibold tracking-widest">
            {{createNodeCurrentObj && createNodeCurrentObj.name ? createNodeCurrentObj.name: '--根节点--'}}
          </div>
        </el-form-item>
        <el-form-item label="名称" :label-width="formLabelWidth">
          <el-input v-model="createNodeForm.name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="createNodeDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateNodeSubmit('createNodeForm')">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 删除Tree节点Dialog -->
    <!-- <el-dialog :visible.sync="removeNodeDialogFormVisible">
      <template #title>
        <h3 class="text-center font-semibold text-2xl">移除该类目影响情况分析</h3>
      </template>

      <div slot="footer" class="dialog-footer">
        <el-button @click="removeNodeDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleRemoveNode">确 定</el-button>
      </div>
    </el-dialog> -->

  </div>
</template>

<script>
  import Vue from 'vue'
  import _ from 'lodash'
  import {mapGetters} from 'vuex'
  import {
    Button as ElButton,
    Input as ElInput,
    Dialog as ElDialog,
    Form as ElForm,
    FormItem as ElFormItem,
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import {SearchInput, Loading} from '@ej/ui'

  import QUERY_MDS_LIST from '@/graphql/settings_manage_mds_list.gql'
  import QUERY_CATEGORIES_LISTS from '@/graphql/categories_lists_new_interface.gql'
  import MUTATION_BUSI_CATEGORY_MENU_ORDER from '@/graphql/busi_category_manage_menu_order.gql'
  import MUTATION_BUSI_CATEGORY_CREATE from '@/graphql/busi_category_manage_create.gql'
  import QUERY_REMOVE_CATEGORY_EFFECT from '@/graphql/busi_category_manage_remove_effect.gql'
  import MUTATION_BUSI_CATEGORY_REMOVE from '@/graphql/busi_category_manage_remove.gql'
  import MUTATION_ADD_MDS_TO_BUSI from '@/graphql/busi_category_manage_add_mds_to_busi.gql'
  import MUTATION_REMOVE_MDS_TO_BUSI from '@/graphql/busi_category_manage_remove_mds_to_busi.gql'
  import MenuTree from '@/components/menu-tree'
  import SettingsLayout from '@/components/settings-layout'
  import CommonPagination from '@/common-components/pagination'
  import ComTooltip from '@/common-components/tooltip'
  import Message from '@/utils/message'
  import {GetFirstNode} from '@/utils/tools'

  Vue.use(SearchInput)
  Vue.use(Loading)
  Vue.use(ComTooltip)

  // 新建关联confirm文案
  const BUSI_CATALOG_CREATE_CONFIRM = {
    message: '即将创建类目与表的关联关系, 是否继续?',
    messageSuccessText: '操作成功',
    messageErrorText: '已取消操作',
  }

  // 取消关联confirm文案
  const BUSI_CATALOG_CANCEL_CONFIRM = {
    message: '即将取消类目与表的关联关系, 是否继续?',
    messageSuccessText: '操作成功',
    messageErrorText: '已取消操作',
  }

  export default {
    name: 'BusiCatalogView',

    components: {
      ElButton,
      ElInput,
      ElDialog,
      ElForm,
      ElFormItem,
      ElTable,
      ElTableColumn,

      MenuTree,
      SettingsLayout,
      CommonPagination,
    },

    data () {
      return {
        treeKeywords: '',

        /** 左侧tree相关 */
        tree: [],
        defaultExpandedKeys: [],
        createNodeType: {
          folder: 'FOLDER',
          file: 'FILE',
        },
        formLabelWidth: '120px',
        createNodeDialogFormVisible: false, // `创建树节点`Dialog 是否显示
        createNodeDialogTitle: '', // `创建树节点`Dialog 标题
        createNodeForm: { // `创建树节点`Dialog Form表单对象
          name: '',
          busiType: '', // 菜单业务类型： 文件夹 or 文件
        },
        createNodeCurrentObj: null, //  `创建树节点`时 上一级节点对象

        searchSelectedBusi: [], // 左侧树 作为搜索条件时 已选择的所有条件

        searchKeyword: '', // 搜索视图下，右侧搜索框的值

        /** 右侧类目相关 */
        isCorrelationView: false, // 当前是否处于关联视图

        dataTypeList: [{label: '数据表', value: 'TABLE'}, {label: '数据接口', value: 'INTERFACE'}, {label: '数据文件', value: 'FILE'}], // 数据对象
        busiCatalogList: [], // 业务类目列表
        multipleSelection: [], // table 复选框 选中的值

        isLoading: false,

        pagination: { // 分页信息
          offset: 0,
          size: 10,
          total: 0,
        },
        currentPage: 1,

        searchParams: { // 搜索条件
          busiCategoryIds: [],
          mdsObjType: null,
          keyword: '',
          offset: 0,
          size: 10,
        },
      }
    },

    computed: {
      ...mapGetters({
        busiTree: 'busiTree',
      }),
    },

    watch: {
      busiTree: {
        immediate: true,
        handler (val) {
          this.tree = this.busiTree
        },
      },
    },

    async created () {
      await this.getBusiCatalogs()

      await this.getExpendFirstNode()

      await this.getObjectList()
    },

    methods: {
      /**
       * 获取业务类目数据
       */
      async getBusiCatalogs () {
        const {data: {categoriesLists}} = await this.$apollo.query({
          query: QUERY_CATEGORIES_LISTS,
          fetchPolicy: 'no-cache',
          variables: {
            input: {
              type: 'BUSINESS',
              status: 'AVAILABLE',
            },
          },
        })

        if (categoriesLists) {
          // 业务类目加入tree
          await this.$store.dispatch('categoriesBusiList')
        }
      },

      /**
       * 获取mdsobject列表
       */
      async getObjectList () {
        this.isLoading = true
        const {data: {mdsLists}} = await this.$apollo.query({
          query: QUERY_MDS_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            input: {...this.searchParams},
          },
        })

        if (mdsLists) {
          this.isLoading = false
          this.busiCatalogList = mdsLists.data
          this.pagination.size = mdsLists.size
          this.pagination.total = mdsLists.total
          this.pagination.offset = mdsLists.offset
        }
      },

      /**
       * 默认展开第一项
       */
      getExpendFirstNode () {
        const {nodes} = GetFirstNode(this.tree)
        this.defaultExpandedKeys = []
        nodes.map(n => {
          this.defaultExpandedKeys.push(n.id)
        })
      },

      /**
       * 节点上移
       */
      async nodeMoveUp (node, data) {
        const _data = data
        const _prevNode = node.previousSibling

        this.$refs.tree.remove(data)
        this.$refs.tree.insertBefore(_data, _prevNode)

        // 关联视图下，选中项保持原来的选中状态
        if (this.isCorrelationView) {
          const _checkedKeys = this.$refs.tree.getCheckedKeys()
          this.$refs.tree.setCheckedKeys(_checkedKeys ? [..._checkedKeys] : [])
          this.defaultExpandedKeys = _checkedKeys
        } else {
          this.defaultExpandedKeys = [_data.id]
        }

        // 发送排序请求
        const _node = this.$refs.tree.getNode(_data)
        let _nodeSiblings = _node.parent.childNodes
        let ids = []
        for (const n of _nodeSiblings) {
          ids.push(n.data.id)
        }

        // 排序
        await this.sendMenuOrder(ids)

        // 刷新数据
        await this.getBusiCatalogs()
      },

      /**
       * 节点下移
       */
      async nodeMoveDown (node, data) {
        const _data = data
        const _nextNode = node.nextSibling
        this.$refs.tree.remove(data)
        this.$refs.tree.insertAfter(_data, _nextNode)

        // 关联视图下，选中项保持原来的选中状态
        if (this.isCorrelationView) {
          const _checkedKeys = this.$refs.tree.getCheckedKeys()
          this.$refs.tree.setCheckedKeys(_checkedKeys ? [..._checkedKeys] : [])
          this.defaultExpandedKeys = _checkedKeys
        } else {
          this.defaultExpandedKeys = [_data.id]
        }

        // 发送排序请求
        const _node = this.$refs.tree.getNode(_data)
        let _nodeSiblings = _node.parent.childNodes
        let ids = []
        for (const n of _nodeSiblings) {
          ids.push(n.data.id)
        }

        // 排序
        await this.sendMenuOrder(ids)

        // 刷新数据
        await this.getBusiCatalogs()
      },

      /**
       * 创建节点
       */
      handleCreateNodeSubmit (createNodeForm) {
        this.$refs[createNodeForm].validate(async (valid) => {
          if (valid) {
            let _ids = []
            const newChild = {id: '-1', name: this.createNodeForm.name, children: []}

            if (this.createNodeCurrentObj.id !== 0) { // 非跟节点
              if (!this.createNodeCurrentObj.children) {
                this.$set(this.createNodeCurrentObj, 'children', [])
              }
              this.createNodeCurrentObj.children.push(newChild)
              _ids = this.createNodeCurrentObj.children.map(c => c.id)
            } else { // 跟节点
              _ids = this.tree.map(t => t.id)
              _ids.push(-1)
            }

            // 添加请求
            const {data: {createCategory}} = await this.$apollo.mutate({
              mutation: MUTATION_BUSI_CATEGORY_CREATE,
              variables: {
                input: {
                  parentLevel: this.createNodeCurrentObj.level,
                  parentId: this.createNodeCurrentObj.id,
                  name: newChild.name,
                  ids: _ids,
                  type: this.createNodeForm.busiType,
                },
              },
            })

            if (createCategory) {
              // 刷新数据
              await this.getBusiCatalogs()

              console.log('this.defaultExpandedKeys', this.defaultExpandedKeys)

              // 展开当前添加的这个节点
              this.defaultExpandedKeys = [createCategory]

              this.createNodeDialogFormVisible = false

              // 重置
              this.createNodeForm = {
                name: '',
                type: '',
              }

              Message.MessageSuccess({messageSuccessText: '操作成功'})
            }
          } else {
            return false
          }
        })
      },

      /**
       * 删除节点
       */
      async nodeRemove (node) {
        let _msg = ''
        let {data: {removeEffectCategory}} = await this.$apollo.query({
          query: QUERY_REMOVE_CATEGORY_EFFECT,
          fetchPolicy: 'no-cache',
          variables: {
            ids: node.data.id,
          },
        })

        if (removeEffectCategory && removeEffectCategory.length > 0) {
          let _category = removeEffectCategory.length > 3 ? removeEffectCategory.splice(0, 3) : removeEffectCategory
          _msg = `删除【${node.data.name}】将会影响${_category.join('、')}..., 是否继续?`
        } else {
          _msg = `此次操作将删除【${node.data.name}】, 是否继续?`
        }

        Message.MessageBoxConfirm(
          {
            message: _msg,
            messageSuccessText: '操作成功',
            messageErrorText: '已取消操作',
          },
          async () => {
            // 删除节点
            const {data: {removeCategory}} = await this.$apollo.mutate({
              mutation: MUTATION_BUSI_CATEGORY_REMOVE,
              variables: {
                ids: node.data.id,
              },
            })

            if (removeCategory) {
              /**
               * 删除该节点时，默认展开当前tree
               */
              if (node.previousSibling) {
                this.defaultExpandedKeys = [node.previousSibling.data.id]
              } else if (node.nextSibling) {
                this.defaultExpandedKeys = [node.nextSibling.data.id]
              } else if (node.parent) {
                this.defaultExpandedKeys = [node.parent.data.id]
              }
              // 刷新数据
              await this.getBusiCatalogs()
            }
          })

        // this.removeNodeDialogFormVisible = false
      },

      /**
       * tree过滤
       */
      filterNode (value, data) {
        if (!value) return true
        return data.name.indexOf(value) !== -1
      },

      /**
       * 当Tree菜单 节点被点击时的回调
       */
      handleNodeClick (data) {
        // this.isCorrelationView 值为`false` 代表搜索视图
        if (!this.isCorrelationView) {
          const _isExistd = this.searchSelectedBusi.find(s => s.id === data.id)
          if (!_isExistd && !data.children) {
            this.searchSelectedBusi.push(data)
          }
        }
      },

      /**
       * 当Tree菜单 复选框 被点击 的时候触发
       */
      handleCheck (data, node) {
        console.log('data', data)
        console.log('node', node)
      },

      /**
       * 点击 `文件夹` or `文件` 新增节点
       * @param {String} [type] 类型： 代表创建文件夹 or 文件
       * @param {String} [Object] 当前节点对象
       */
      handleTreeCreateNode (type, data = {id: 0, level: 0}) {
        if (type === this.createNodeType.folder) {
          this.createNodeDialogTitle = '新建分类'
          this.createNodeForm.busiType = 'FOLDER'
        }

        if (type === this.createNodeType.file) {
          this.createNodeDialogTitle = '新建文件'
          this.createNodeForm.busiType = 'FILE'
        }
        this.createNodeCurrentObj = data
        this.createNodeDialogFormVisible = true
      },

      handleTreesearch (args) {
        this.$refs.tree.filter(args)
      },

      /**
       * 新建关联
       */
      handleCreateCorrelation () {
        if (this.multipleSelection.length === 0) {
          Message.MessageError({messageErrorText: '请选择要关联的表'})
          return
        }
        if (this.$refs.tree.getCheckedKeys().length === 0) {
          Message.MessageError({messageErrorText: '请选择要关联的类目'})
          return
        }

        Message.MessageBoxConfirm(
          BUSI_CATALOG_CREATE_CONFIRM,
          async () => {
            // 建立关联关系
            const {data: {addMdsToBusi}} = await this.$apollo.mutate({
              mutation: MUTATION_ADD_MDS_TO_BUSI,
              variables: {
                mdsIds: this.multipleSelection.map(m => m.id),
                busiCateIds: this.$refs.tree.getCheckedKeys(),
              },
            })

            if (addMdsToBusi) {
              this.isCorrelationView = false
              this.multipleSelection = []
              this.$refs.multipleTable.clearSelection()
            }
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
        if (this.$refs.tree.getCheckedKeys().length === 0) {
          Message.MessageError({messageErrorText: '请选择要取消关联的类目'})
          return
        }

        Message.MessageBoxConfirm(
          BUSI_CATALOG_CANCEL_CONFIRM,
          async () => {
            // 取消关联关系
            const {data: {removeMdsToBusi}} = await this.$apollo.mutate({
              mutation: MUTATION_REMOVE_MDS_TO_BUSI,
              variables: {
                mdsIds: this.multipleSelection.map(m => m.id),
                busiCateIds: this.$refs.tree.getCheckedKeys(),
              },
            })
            if (removeMdsToBusi) {
              this.isCorrelationView = false
              this.multipleSelection = []
              this.$refs.multipleTable.clearSelection()
            }
          })
      },

      /**
       * 类目搜索
       */
      handleSearch: _.debounce(function (searchFlag, arg) {
        // 重置页码
        this.searchParams.offset = this.pagination.offset = 0
        this.currentPage = 1

        if (searchFlag === 'btn') {
          this.searchParams.keyword = this.searchKeyword = arg.keywords
        }

        this.searchParams.busiCategoryIds = arg.busiList.map(bt => bt.id) || null
        this.searchParams.mdsObjType = arg.custom[0] || null

        this.getObjectList()
      }, 300),

      /**
       * 勾选复选框时候出发
       */
      handleTableSelectionChange (selection) {
        this.multipleSelection = selection

        if (selection.length > 0) {
          this.isCorrelationView = true
        } else {
          this.isCorrelationView = false

          this.$refs.tree.setCheckedKeys([])
        }
      },

      /**
       * 点击分页时触发
       */
      handleCurrentChange (page) {
        this.searchParams.offset = this.pagination.offset = (page - 1) * this.pagination.size
        this.searchParams.busiCategoryIds = this.searchSelectedBusi.map(s => s.id)
        this.getObjectList()
      },

      /**
       * Server: 发送排序请求
       */
      async sendMenuOrder (ids = []) {
        const {data: {updateOrder}} = await this.$apollo.mutate({
          mutation: MUTATION_BUSI_CATEGORY_MENU_ORDER,
          variables: {ids},
        })

        if (updateOrder) {
          Message.MessageSuccess({messageSuccessText: '操作成功'})
        }
      },

      cnAndEn (it) {
        return it.chineseName ? `${it.name}(${it.chineseName})` : it.name
      },
    },
  }
</script>

<style lang="scss">
  .create-node-dialog {
    .el-form-item__label {
      @apply text-gray-darkest;
    }
    .previous-sibling-id {
      .el-form-item__content {
        line-height: 0;
      }
    }
  }
  .busi-catalog-view {
    @apply flex;

    > section {
      @apply bg-white;
    }

    > .left {
      @apply flex-none;

      width: 320px;
      margin-right: 2px;

      .tree-catalog-wrap {
        @apply w-full;

        .tree-opera-wrap {
          @apply text-center hidden ;
          // float-right

          > span {
            @apply ml-1 inline-block text-center bg-gray-light;

            width: 18px;
            height: 18px;
            line-height: 16px;

            & > i {
              @apply text-xs text-gray-dark font-black ;
            }

            &:hover {
              @apply border-blue-light bg-blue-lighter;
              i {
                @apply font-black text-black text-blue;
              }
            }
          }
        }

        &:hover {
          .tree-opera-wrap {
            @apply inline-block;
          }
        }
      }

      .el-button {
        @apply text-sm shadow tracking-widest;

        padding: 6px 17px;
        border-radius: 2px;

        &:hover,
        &:focus {
          @apply text-white bg-blue-light #{!important};
        }

        &.btnActive {
          @apply text-white bg-blue-light #{!important};
        }
      }
      .el-button--primary.is-plain {
        color: theme('colors.blue.default');
        background: theme('colors.blue.lighter');
        border: none;
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

      .app-pagination {
        @apply my-6 text-right;
      }
    }
  }
</style>
