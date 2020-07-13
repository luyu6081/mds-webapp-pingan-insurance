<template>
  <div class="versions-view">
    <div class="flex items-center">
      <div class="text-sm pl-1">已选中{{checkedIds.length}}个版本（注：支持2个版本进行对比）</div>
      <a href="javascript:" @click="gotoCompared" class="ml-auto py-1 px-2 dqs-btn mb-2">版本对比</a>
    </div>
    <common-table :data="versionList" @selection-change="selectionChange">
      <el-table-column type="selection" width="50"/>
      <el-table-column label="版本号" prop="version"/>
      <el-table-column label="版本内容" prop="content"/>
      <el-table-column label="版本日期" prop="date">
        <template #default="scope">
          <span v-if="scope.row.date">{{scope.row.date|format}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{row}">
          <a href="javascript:" @click="gotoDetail(row.version)" class="inline-flex text-blue">查看</a>
        </template>
      </el-table-column>
    </common-table>
    <el-dialog :title="`${verDialog.title || ''}版本信息查看`" append-to-body :visible.sync="verDialog.visible">
      <div v-if="Object.keys(verDialog.data).length">
        <div class="flex mb-2 px-1">
          <span>共{{verDialog.data.mdsColumns.length}}个字段</span>
          <span class="ml-auto">存储量：{{verDialog.data.storageSize}}KB</span>
        </div>
        <common-table :data="verDialog.data.mdsColumns">
          <el-table-column label="序号" type="index"/>
          <el-table-column label="字段名称" prop="name"/>
          <el-table-column label="字段类型" prop="type"/>
          <el-table-column label="描述" prop="desc"/>
        </common-table>
      </div>
    </el-dialog>
    <el-dialog title="版本对比" append-to-body :visible.sync="verComparedDialog.visible">
      <div v-if="verComparedDialog.data.length">
        <div class="flex mb-2 text-lg">
          <span class="flex-1 text-center">{{verComparedDialog.data[0].versionId}}</span>
          <span class="flex-1 text-center">{{verComparedDialog.data[1].versionId}}</span>
        </div>
        <ej-code-diff :old-string="verComparedDialog.data[0].ddl"
                      :new-string="verComparedDialog.data[1].ddl"
                      :context="10"
                      outputFormat="side-by-side"
                      class="code-diff"/>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {TableColumn, Dialog} from 'element-ui'

  import {Loading} from '@ej/ui'

  import {formatDate} from '@/utils/date.js'
  import DETAILS_VERSION_DATA from '@/graphql/details_version_data.gql'
  import QUERY_DETAIL from '@/graphql/version/detail.gql'
  import QUERY_COMPARED_DDL from '@/graphql/version/compared_DDL.gql'

  import CommonTable from '@/common-components/table'
  import CodeDiff from '@/components/code-diff'

  Vue.use(TableColumn)
  Vue.use(Loading)
  Vue.use(CommonTable)
  Vue.use(Dialog)
  Vue.use(CodeDiff)

  export default {
    name: 'VersionsView',

    filters: {
      format (utcDate) {
        return formatDate(new Date(utcDate))
      },
    },

    apollo: {
      versionList: {
        query: DETAILS_VERSION_DATA,
        variables () {
          return {
            mdsObjectId: this.$route.params.dataId,
          }
        },
        fetchPolicy: 'network-only',
        update: data => data.versionList,
      },
    },

    data () {
      return {
        checkedIds: [],
        verDialog: {
          visible: false,
          data: {},
        },
        verComparedDialog: {
          visible: false,
          data: [],
        },
      }
    },

    methods: {
      selectionChange (selection) {
        this.checkedIds = selection.map(it => it.version)
      },

      async gotoCompared () {
        if (this.checkedIds.length !== 2) {
          this.$message({
            message: '只能选择2个版本',
            type: 'warning',
          })
          return false
        }
        const data = await this.$apollo.query({
          query: QUERY_COMPARED_DDL,
          fetchPolicy: 'network-only',
          variables: {
            mdsObjectId: this.$route.params.dataId,
            verIds: this.checkedIds,
          },
        })

        this.verComparedDialog.data = data.data.data
        this.verComparedDialog.visible = true
      },

      async gotoDetail (version) {
        /* 查看详情模态框 */
        const data = await this.$apollo.query({
          query: QUERY_DETAIL,
          fetchPolicy: 'network-only',
          variables: {
            mdsObjectId: this.$route.params.dataId,
            version: version,
          },
        })
        this.verDialog.data = data.data.data
        this.verDialog.visible = true
      },
    },
  }
</script>

<style lang="scss">
  .detail-view .versions-view {
    padding: 15px;
  }

  .code-diff {
    height: 500px;
    overflow-y: auto;

    .d2h-code-side-linenumber {
      position: static;
    }
  }

  .code-diff-test {
    height: 500px;
    overflow-y: auto;
  }
</style>
