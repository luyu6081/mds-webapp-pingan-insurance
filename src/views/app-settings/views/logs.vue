<template>
  <div class="logs-view">
    <settings-layout layout="GENERAL"
                     search-input-width="440"
                     @search="handleSearch">

      <template #mainArea>
        <el-table ref="multipleTable"
                  :data="logList"
                  :span-method="arraySpanMethod"
                  tooltip-effect="dark"
                  style="width: 800px">
          <el-table-column label="序号" type="index" width="48"/>
          <el-table-column label="平台名称" prop="platformName"/>
          <el-table-column label="系统名称" prop="systemName" show-overflow-tooltip/>
           <el-table-column label="数据库名称" prop="dbname" width="100" show-overflow-tooltip/>
          <el-table-column label="变更信息" prop="deleteAmount" width="100">
            <template #default="{row}">
              <p>新增数：{{row.insertAmount}}</p>
              <p>修改数：{{row.updateAmount}}</p>
              <p>删除数：{{row.deleteAmount}}</p>
            </template>
          </el-table-column>
          <el-table-column label="最后操作信息" type="index" width="220">
            <template #default="{row}">
              <p>操作人：{{row.creatorMan.name ? row.creatorMan.name : '--'}}</p>
              <p>操作时间：{{convertFormatDate(row.createTm)}}</p>
            </template>
          </el-table-column>
        </el-table>

        <common-pagination  background
                            :current-page="currentPage"
                            :page-size="pagination.size"
                            :total="pagination.total"
                            @current-change="handleCurrentChange"/>
      </template>
    </settings-layout>
  </div>
</template>

<script>
  import {
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import SettingsLayout from '@/components/settings-layout'
  import QUERY_LOG_MANAGE_LIST from '@/graphql/log_manage_list.gql'
  import CommonPagination from '@/common-components/pagination'
  import {formatDate} from '@/utils/date'

  export default {
    name: 'LogsView',

    components: {
      ElTable,
      ElTableColumn,

      SettingsLayout,
      CommonPagination,
    },

    data () {
      return {
        multipleSelection: [],
        keyword: '',

        pagination: { // 分页信息
          offset: 0,
          size: 10,
          total: 0,
        },
        currentPage: 1,
      }
    },

    apollo: {
      logList: {
        query: QUERY_LOG_MANAGE_LIST,
        fetchPolicy: 'no-cache',
        variables () {
          return {
            input: {
              keyword: this.keyword,
              size: this.pagination.size,
              offset: this.pagination.offset,
            },
          }
        },
        update (data) {
          if (data.logList) {
            this.pagination.total = data.logList.total
            this.pagination.size = data.logList.size
            return data.logList.data
          }
          return []
        },
      },
    },

    methods: {
      arraySpanMethod ({row, column, rowIndex, columnIndex}) {
        if (columnIndex === 10) {
          return [1, 2]
        }
      },

      /**
       * 转换日期格式
       */
      convertFormatDate (date) {
        return formatDate(new Date(date))
      },

      /**
       * 搜索
       */
      handleSearch (args) {
        this.keyword = args
        this.pagination.offset = 0
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
  .logs-view {
    @apply bg-white p-6;
    .app-pagination {
      @apply my-6 text-right;
    }
  }
</style>
