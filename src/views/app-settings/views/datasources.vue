<template>
  <div class="data-source-view">
    <settings-layout layout="GENERAL"
                     search-input-width="440"
                     @search="handleSearch">
      <template #buttonArea>
        <el-button type="primary" plain @click="dataSourceDialogVisible = true, dataSourceDiglogTitle = 'create'">新增</el-button>
        <el-button type="primary" plain @click="handleRemove">删除</el-button>
      </template>

      <template #mainArea>
        <el-table v-ej-loading="$apollo.queries.dataSources.loading"
                  ref="multipleTable"
                  :data="dataSources"
                  tooltip-effect="dark"
                  style="width: 100%"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="45"/>
          <el-table-column label="序号" type="index" width="50">
              <template slot-scope="scope">{{ scope.$index + pagination.offset + 1 }}</template>
            </el-table-column>
          <el-table-column label="显示名称" prop="name"/>
          <el-table-column label="数据源地址" prop="address"/>
          <el-table-column label="操作日期" prop="modifyTm" width="180">
            <template #default="{row}">
              {{convertFormatDate(row.modifyTm)}}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="100">
            <template #default="{row}">
              <el-button type="text" @click="dataSourceDiglogTitle = 'update', handleEdit(row)">编辑</el-button>
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

    <el-dialog :visible.sync="dataSourceDialogVisible" @close="dataSourceForm = {...defaultDataSourceForm}">
      <template #title>
        <h3 class="text-center text-2xl font-semibold">{{dataSourceDiglogTitle === 'update' ? '编辑数据源' : '新增数据源'}}</h3>
      </template>
      <el-form ref="dataSourceForm" :rules="rules" :model="dataSourceForm" class="data-source-form">
        <el-form-item label="数据库" :label-width="formLabelWidth" prop="type">
          <el-select v-model="dataSourceForm.type" clearable placeholder="请选择数据库">
            <el-option v-for="item in dbList" :key="item" :label="item" :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item label="显示名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="dataSourceForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="数据库地址" :label-width="formLabelWidth" prop="address">
          <el-input v-model="dataSourceForm.address" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="端口号" :label-width="formLabelWidth" prop="port">
          <el-input v-model="dataSourceForm.port" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="参数" :label-width="formLabelWidth">
          <el-input v-model="dataSourceForm.args" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="userName">
          <el-input v-model="dataSourceForm.userName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="password">
          <el-input v-model="dataSourceForm.password" autocomplete="off" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="handleConnectTest('dataSourceForm')" :loading="connectTestLoading">连接测试</el-button>
        <el-button type="primary" size="small" :disabled="connectTestLoading" @click="handleSubmit('dataSourceForm')">提交</el-button>
      </div>
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
    Select as ElSelect,
    Option as ElOption,
  } from 'element-ui'

  import {Loading} from '@ej/ui'

  import QUERY_DBSOURCE_LIST from '@/graphql/dbsource_list.gql'
  import QUERY_DBSOURCE_DATABASE_LIST from '@/graphql/dbsource_database_list.gql'
  import QUERY_DETECTION_DB_SOURCE from '@/graphql/dbsource_detection_db_source.gql'
  import MUTATION_SAVE_DBSOURCE from '@/graphql/dbsource_add_and_update.gql'
  import MUTATION_REMOVE_DBSOURCE from '@/graphql/dbsource_remove.gql'
  import SettingsLayout from '@/components/settings-layout'
  import CommonPagination from '@/common-components/pagination'
  import Message from '@/utils/message'
  import {formatDate} from '@/utils/date'
  import {wait} from '@/utils/async'

  Vue.use(Loading)

  export default {
    name: 'DatasourcesView',

    components: {
      ElButton,
      ElTable,
      ElTableColumn,
      ElDialog,
      ElForm,
      ElFormItem,
      ElInput,
      ElSelect,
      ElOption,

      SettingsLayout,
      CommonPagination,
    },

    data () {
      const errorTip = {
        MAG_DB_TYPE_REQUIRE: '请选择数据库',
        MAG_NAME_REQUIRE: '请输入名称',
        MAG_ADDRESS_REQUIRE: '请输入数据库地址',
        MAG_PORT_REQUIRE: '请输入端口号',
        MAG_USERNAME_REQUIRE: '请输入用户名',
        MAG_PASSWORD_REQUIRE: '请输入密码',
      }

      return {
        keyword: '',

        multipleSelection: [],

        dataSourceDiglogTitle: 'update',
        dataSourceDialogVisible: false,
        formLabelWidth: '120px',

        defaultDataSourceForm: {
          id: '',
          type: '',
          name: '',
          address: '',
          port: undefined,
          args: '',
          userName: '',
          password: '',
        },

        dataSourceForm: {
          id: '',
          type: '',
          name: '',
          address: '',
          port: undefined,
          args: '',
          userName: '',
          password: '',
        },

        rules: {
          type: [{required: true, message: errorTip.MAG_DB_TYPE_REQUIRE, trigger: 'blur'}],
          name: [{required: true, message: errorTip.MAG_NAME_REQUIRE, trigger: 'blur'}],
          address: [{required: true, message: errorTip.MAG_ADDRESS_REQUIRE, trigger: 'blur'}],
          port: [{required: true, message: errorTip.MAG_PORT_REQUIRE, trigger: 'blur'}],
          userName: [{required: true, message: errorTip.MAG_USERNAME_REQUIRE, trigger: 'blur'}],
          password: [{required: true, message: errorTip.MAG_PASSWORD_REQUIRE, trigger: 'blur'}],
        },

        pagination: { // 分页信息
          offset: 0,
          size: 10,
          total: 0,
        },
        currentPage: 1,

        // 连接测试loading
        connectTestLoading: false,
      }
    },

    apollo: {
      dbList: {
        query: QUERY_DBSOURCE_DATABASE_LIST,
        fetchPolicy: 'no-cache',
        update: data => data.dbSourceType,
      },

      dataSources: {
        query: QUERY_DBSOURCE_LIST,
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
          if (data.dbsources) {
            this.pagination.total = data.dbsources.total
            this.pagination.size = data.dbsources.size
            return data.dbsources.data
          }
          return []
        },
      },
    },

    methods: {
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
       * 表单提交：新增 or 编辑
       */
      handleSubmit (formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            this.dataSourceDialogVisible = false

            const {data: {saveDbSource}} = await this.$apollo.mutate({
              mutation: MUTATION_SAVE_DBSOURCE,
              variables: {
                input: {...this.dataSourceForm},
              },
            })

            if (saveDbSource) {
              Message.MessageSuccess({messageSuccessText: '操作成功'})

              this.$apollo.queries.dataSources.refresh()

              this.dataSourceForm = {...this.defaultDataSourceForm}
            }
          } else {
            return false
          }
        })
      },

      /**
       * 点击`编辑`按钮
       */
      handleEdit (row) {
        this.dataSourceForm = {
          id: row.id,
          type: row.type,
          name: row.name,
          address: row.address,
          port: row.port,
          args: row.args,
          userName: row.userName,
          password: row.password,
        }
        this.dataSourceDialogVisible = true
      },

      /**
       * 删除：删除数据源，支持多选删除
       */
      async handleRemove () {
        if (!this.multipleSelection.length) {
          Message.MessageError({messageErrorText: '请选择要删除的数据'})
        } else {
          const {data: {removeDbSource}} = await this.$apollo.mutate({
            mutation: MUTATION_REMOVE_DBSOURCE,
            variables: {
              ids: this.multipleSelection.map(m => m.id),
            },
          })

          if (removeDbSource) {
            Message.MessageSuccess({messageSuccessText: '删除成功'})
            this.$apollo.queries.dataSources.refresh()
          }
        }
      },

      /**
       * 连接测试
       */
      handleConnectTest (formName) {
        this.connectTestLoading = true
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            await wait(600)

            const {data: {detectionDbSource}} = await this.$apollo.query({
              query: QUERY_DETECTION_DB_SOURCE,
              fetchPolicy: 'network-only',
              variables: {
                input: {...this.dataSourceForm},
              },
            })
            this.connectTestLoading = false
            if (detectionDbSource) {
              Message.MessageSuccess({messageSuccessText: `连接${this.dataSourceForm.type}数据库成功`})
            } else {
              Message.MessageError({messageErrorText: `连接${this.dataSourceForm.type}数据库失败`})
            }
          } else {
            return false
          }
        })
      },

      /**
       * 触发时机：勾选复选框
       */
      handleSelectionChange (val) {
        this.multipleSelection = val
        console.log('val', val)
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
  .data-source-view {
    @apply bg-white p-6;
    .data-source-form {
      .el-select {
        width: 100%;
      }
    }
    .app-pagination {
      @apply my-6 text-right;
    }
  }
</style>
