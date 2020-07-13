<template>
  <div class="field-view">
    <common-table :data="tableData"
              style="width: 100%;margin-bottom: 20px;"
              row-key="key"
              default-expand-all
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column prop="name" label="字段名" width="180"></el-table-column>
      <el-table-column prop="type" label="字段类型" width="180"></el-table-column>
      <el-table-column prop="desc" label="字段描述"></el-table-column>
    </common-table>
  </div>
</template>

<script>
  import {
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import CommonTable from '@/common-components/table'

  export default {
    name: 'FieldDetail',

    components: {
      ElTableColumn,
      CommonTable,
    },

    props: {
      data: Object,
    },

    data () {
      return {
        fieldData: {},
      }
    },

    computed: {
      tableData () {
        const jsonData = this.data.columnsJson ? JSON.parse(this.data.columnsJson) : []

        let nums = 0

        function each (data = [], ms = nums) {
          for (let i = 0; i < data.length; i++) {
            ++nums
            data[i].key = nums // 为每条数据生成一个key, 用于设置tree-table的row-key
            if (data[i].children && data[i].children.length > 0) {
              return each(data[i].children, nums)
            }
          }
        }

        each(jsonData)

        return jsonData
      },
    },

    methods: {

    },
  }
</script>

<style lang="scss">
  .mongo-field-detail {

  }
</style>
