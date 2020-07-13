<template>
  <div class="category-schedule-view p-6">
    <section class="left w-3/5">
      <section class="mb-4">
        <h2 class="text-xl font-semibold text-gray-darkest mb-4">数据源信息</h2>
        <ej-info-list :data="datasourceInfo" :columns="2"/>
      </section>
      <section v-if="techCategoryDetail && techCategoryDetail.schedule" class="mb-4">
        <h2 class="text-xl font-semibold text-gray-darkest mb-4">调度信息</h2>
        <dl class="flex">
          <dt class="w-1/8">调度周期:</dt>
          <dd class="flex-1 ml-2 text-gray-darker">{{techCategoryDetail.schedule.scheduledType}}</dd>
        </dl>
        <dl class="flex">
          <dt class="w-1/8">执行时间:</dt>
          <dd class="flex-1 ml-2 text-gray-darker">{{techCategoryDetail.schedule.scheduledTime}}</dd>
        </dl>
        <dl class="flex">
          <dt class="w-1/8">联系人:</dt>
          <dd v-for="item in techCategoryDetail.schedule.techMans" :key="item.id" class="ml-3">
            <ej-user-card :data="{userId:item.id,
                                  name: item.name,
                                  position: item.position,
                                  userAvatar: avatarUrl + item.avatar,
                                  jobNumber: item.jobNumber,
                                  phone: item.phone,
                                  telephone: item.telephone,
                                  email: item.email,
                                  department: item.depts,
                                  userAddress: item.address}" :hasEmail="!!item.email" @mail="sendMail">
              <template slot="img">
                <img style="width: 25px; height: 25px" class="rounded-full" :src="avatarUrl + item.avatar"/>
                <span class="ml-2 text-blue">{{item.name}}</span>
              </template>
            </ej-user-card>
          </dd>
        </dl>
      </section>
    </section>
    <section class="right w-2/5">
      <header>
        <h2 class="text-xl font-semibold text-gray-darkest mb-4">调度日志</h2>
        <el-button type="primary" plain @click="handleImportExcel">导出</el-button>
      </header>
      <el-table ref="multipleTable"
                :data="scheduleLogs"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"/>
        <el-table-column prop="modifyTm" label="调度时间">
          <template #default="{row}">
            {{row.modifyTm | formatDate}}
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" width="120" fixed="right">
          <template #default="{row}">
            {{row.desc ? row.desc : '--'}}
          </template>
        </el-table-column>
      </el-table>
      <common-pagination  background
                          :current-page.sync="currentPage"
                          :page-size="pagination.size"
                          :total="pagination.total"
                          @current-change="handleCurrentChange"/>
    </section>
  </div>
</template>

<script>
  import {
    Button as ElButton,
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import {InfoList as EjInfoList, UserCard as EjUserCard} from '@ej/ui'

  import runtimeArgs from '@/runtime-args'
  import QUERY_TECH_CATEGORY_DETAIL from '@/graphql/tech_manage_tech_category_detail.gql'
  import QUERY_SCHEDULE_LIST from '@/graphql/tech_manage_schedule_list.gql'
  import QUERY_SCHEDULE_LOG_FILE from '@/graphql/tech_manage_schedule_download.gql'
  import {formatDate} from '@/utils/date'
  import CommonPagination from '@/common-components/pagination'

  /** 下载地址 */
  const FILE_DOWNLOAD_ADDRESS = runtimeArgs.VUE_APP_DOWNLOAD_HTTP
  const _avatarUrl = `${FILE_DOWNLOAD_ADDRESS}?ambryId=`

  export default {
    name: 'CategoryScheduleView',

    components: {
      ElButton,
      ElTable,
      ElTableColumn,

      EjInfoList,
      EjUserCard,

      CommonPagination,
    },

    props: {
      categoryId: {
        type: String,
        required: true,
      },
    },

    data () {
      return {
        multipleSelection: [],
        pagination: {
          offset: 0,
          size: 10,
          total: 0,
        },
        currentPage: 1,
      }
    },

    computed: {
      /** 数据源信息 */
      datasourceInfo () {
        return [
          {name: '数据库', value: '', key: 'type'},
          {name: '显示名称', value: '', key: 'name'},
          {name: '数据库地址', value: '', key: 'address'},
          {name: '数据库名', value: '', key: 'dbName'},
          {name: '端口号', value: '', key: 'port'},
          {name: '用户名', value: '', key: 'userName'},
          {name: '密码', value: '', key: 'password'},
        ]
      },

      avatarUrl () {
        return _avatarUrl
      },
    },

    filters: {
      formatDate (val) {
        return formatDate(new Date(val))
      },
    },

    apollo: {
      techCategoryDetail: { // 详情
        query: QUERY_TECH_CATEGORY_DETAIL,
        variables () {
          return {
            techCatalogId: this.$route.params.categoryId,
          }
        },
        update (data) {
          const _detail = data.techDataDetail
          this.datasourceInfo.map(d => {
            if (d.key === 'type') {
              d.value = _detail.dbSource.type
            } else if (d.key === 'name') {
              d.value = _detail.dbSource.name
            } else if (d.key === 'address') {
              d.value = _detail.dbSource.address
            } else if (d.key === 'port') {
              d.value = _detail.dbSource.port
            } else if (d.key === 'userName') {
              d.value = _detail.dbSource.userName
            } else if (d.key === 'password') {
              d.value = _detail.dbSource.password
            } else if (d.key === 'dbName') {
              d.value = _detail.schedule.dbName
            }
          })
          return _detail
        },
      },
      scheduleLogs: { // 调度日志列表
        query: QUERY_SCHEDULE_LIST,
        variables () {
          return {
            input: {
              offset: this.pagination.offset,
              size: this.pagination.size,
              mdsScheduleId: this.techCategoryDetail && this.techCategoryDetail.schedule ? this.techCategoryDetail.schedule.id : '-1',
            },
          }
        },
        update (data) {
          this.pagination.total = data.scheduleLog.total
          return data.scheduleLog.data
        },
      },
    },

    methods: {
      sendMail () {
        console.log('发送邮件')
      },

      handleSelectionChange (val) {
        this.multipleSelection = val
      },

      /**
       * 导出调度日志列表
       */
      async handleImportExcel () {
        const {data: {scheduleLogFile}} = await this.$apollo.query({
          query: QUERY_SCHEDULE_LOG_FILE,
          variables: {
            logIds: this.multipleSelection.map(m => m.id),
          },
        })

        if (scheduleLogFile) {
          const downloadElement = document.createElement('a')
          downloadElement.href = scheduleLogFile
          downloadElement.download = scheduleLogFile
          document.body.appendChild(downloadElement)
          downloadElement.click()
          document.body.removeChild(downloadElement)
          window.URL.revokeObjectURL(scheduleLogFile)
        }
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
  @import '../../../style/variables';

  .category-schedule-view {
    @apply mx-auto flex bg-white;

    width: $page-width-default;

    > .left {
      .ej-info-list {
        .label {
          @apply text-gray-darkest;
        }
        .text {
          @apply text-gray-darker;
        }
      }
    }

    > .right {

      > header {
        @apply flex items-center;

        .el-button {
          @apply ml-auto text-sm shadow tracking-widest;

          padding: 6px 17px;
          margin-top: -14px;
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

      .el-table {
        margin-top: 10px;
      }
      .el-table th, .el-table thead {
        @apply text-gray-darkest text-base bg-gray-lighter #{!important}
      }

      .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        @apply bg-blue border-blue #{!important};
      }

      .el-table td, .el-table th {
        padding: 10px 0;
      }
    }
  }
</style>
