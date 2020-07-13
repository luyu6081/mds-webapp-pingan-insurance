<template>
  <div class="address-book">
    <div class="header clearfix">
      <h3 class="font-semibold text-gray-darkest float-left">通讯录</h3>
      <span class="text-gray-dark float-right text-sm">已选择：{{selectPeople}}人</span>
    </div>
    <div class="content p-2">
      <el-input v-model="filterText" placeholder="输入关键字过滤" @keyup.enter.native="search"/>
      <div class="tree-wrap">
        <el-tree  ref="tree"
                  :data="addressBooks"
                  node-key="id"
                  show-checkbox
                  :default-expanded-keys="expandedKeys"
                  :default-checked-keys="checkedKeys"
                  :props="defaultProps"
                  :filter-node-method="filterNode"
                  class="filter-tree"
                  @check="handleCheck"/>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    Input as ElInput,
    Tree as ElTree,
  } from 'element-ui'

  import QUERY_USER_ADDRESS_BOOK from '@/graphql/user_address_book.gql'
  import {GetTreeNode} from '@/utils/tools'

  // const MOCK_PERSON_DATA = () => {
  //   return [{
  //     id: 1,
  //     label: '数据研究院',
  //     children: [{
  //       id: 4,
  //       label: '姓名A',
  //     }, {
  //       id: 9,
  //       label: '姓名B',
  //     }, {
  //       id: 10,
  //       label: '姓名C',
  //     }],
  //   }, {
  //     id: 2,
  //     label: '一级 2',
  //     children: [{
  //       id: 5,
  //       label: '二级 2-1',
  //     }, {
  //       id: 6,
  //       label: '二级 2-2',
  //     }],
  //   }, {
  //     id: 3,
  //     label: '一级 3',
  //     children: [{
  //       id: 7,
  //       label: '二级 3-1',
  //     }, {
  //       id: 8,
  //       label: '二级 3-2',
  //     }],
  //   }]
  // }

  export default {
    name: 'AddressBook',

    components: {
      ElInput,
      ElTree,
    },

    props: {
      techDirectors: {
        type: Array,
        default: () => [],
      },
    },

    data () {
      return {
        filterText: '',
        defaultProps: {
          children: 'children',
          label: 'label',
        },
        data: [],

        // 已选择的人数
        selectPeople: 0,

        // 展开行
        expandedKeys: [],

        // 选中的节点
        checkedKeys: [],
      }
    },

    watch: {
      filterText (val) {
        this.$refs.tree.filter(val)
      },
    },

    apollo: {
      $client: 'ucClient',
      addressBooks: {
        query: QUERY_USER_ADDRESS_BOOK,
        update (data) {
          console.log('data====book==', data, GetTreeNode(data.organization))
          return GetTreeNode(data.organization)
        },
      },
    },

    created () {
      // this.data = MOCK_PERSON_DATA()
      this.expandedKeys = this.checkedKeys = this.techDirectors
      this.selectPeople = this.techDirectors.length
    },

    methods: {
      filterNode (value, data) {
        if (!value) return true
        return data.label.indexOf(value) !== -1
      },

      search (arg) {
        console.log('arg', arg)
      },

      /**
       * 选择`节点`时触发
       */
      handleCheck (currentNode, checkNodes) {
        let _checkedNodes = checkNodes.checkedNodes
        let childrenList = []

        if (_checkedNodes) {
          childrenList = _checkedNodes.filter(cd => !cd.children)
        }
        this.selectPeople = childrenList ? childrenList.length : 0
        this.$emit('check-node', childrenList)
      },
    },
  }
</script>

<style lang="scss">
  .address-book {
    @apply border-2 border-solid border-gray-lighter rounded;

    width: 228px;

    .header {
      @apply bg-gray-lightest border-b border-solid border-gray-lighter pl-2 pr-3;

      height: 36px;
      line-height: 36px;
    }

    .content {
      height: 200px;
      overflow: hidden;

      .el-input__inner {
        border-radius: 20px;
      }

      .tree-wrap {
        width: 230px;
        height: 152px;
        overflow: auto;
      }
    }
  }
</style>
