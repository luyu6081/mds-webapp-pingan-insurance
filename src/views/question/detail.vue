<template>
  <div class="question-detail-view">
    <div class="question-left bg-white clearfix">
      <detail-item :item="info"/>
      <div class="action">
        <span class="flex-1"></span>
        <el-button type="primary"
                   icon="el-icon-edit"
                   size="mini"
                   class="bg-blue reply"
                   @click="dialogShow">回复
        </el-button>
        <ej-icon icon="message" class="icon-num"/>

        <span class="total">{{total}}</span>
      </div>
      <div class="list">
        <div v-for="(item, key) in list" :key="key" class="list-item">
          <detail-item :item="item"/>
        </div>
      </div>
      <div class="float-right">
        <common-pagination background
                           :total="total"
                           :page-size="params.size"
                           @current-change="change"/>
      </div>
    </div>
    <div class="question-right bg-white">
      <div class="table-title">
        <span class="text text-black">{{table.title_en}} ({{table.title_zh}})</span>
        <div class="title-left">
          <img src="@/assets/icon-fire.svg" class="icon-fire"/>
          <span class="table-views">{{table.views}}</span>
          <img src="@/assets/icon-high-quality.svg" class="icon-eval"/>
        </div>
      </div>
      <el-table :data="table.fields"
                :header-cell-style="{background: '#fafafa'}"
                border
                style="width: 100%">
        <el-table-column label="序号" prop="num" width="50"/>
        <el-table-column label="字段名称" prop="name"/>
        <el-table-column label="字段类型" prop="type"/>
      </el-table>
    </div>

    <el-dialog title="回复" :visible.sync="dialog.visible" width="50%" show-close>
      <ej-text-editor v-model="dialog.params.value" :rows="5" placeholder="回复信息不能为空"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogHide">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {Button, Table, TableColumn, Dialog, Message} from 'element-ui'

  import {Icon, TextEditor as EjTextEditor} from '@ej/ui'

  import CommonPagination from '@/common-components/pagination'
  import DetailItem from './detail-item.vue'

  Vue.use(Icon)

  Vue.use(Button)
  Vue.use(Dialog)
  Vue.use(Table)
  Vue.use(TableColumn)

  Vue.use(CommonPagination)

  export default {
    name: 'QuestionDetailView',

    components: {
      EjTextEditor,
      DetailItem,
    },

    data () {
      return {
        id: '',
        dialog: {
          visible: false,
          params: {
            value: '',
          },
        },
        visible: false,
        info: {},
        list: [],
        total: '',
        table: {},
        params: {
          page: 1,
          size: 10,
        },
      }
    },

    created () {
      this.init()
    },

    methods: {
      init () {
        this.id = this.$route.params.questionId
        this.queryData()
      },
      queryData () {
        const data = require('@/../static/data/question/detail.json')
        this.info = data.info
        this.total = data.data.total
        this.list = data.data.list
        this.table = data.table
      },
      dialogShow () {
        this.dialog.visible = true
      },
      dialogHide () {
        /*
        this.dialog = {
          visible: false,
          params: {
            value: '',
          },
        }
        */
        this.dialog.visible = false
        this.dialog.params.value = ''
      },
      ok () {
        /*
         * todo:
         * 提交信息回复信息
         *  1.验证信息不能为空
         *    为空时不能隐藏模态框
         *    提交成功提示 :操作成功,清空信息
         */
        let params = this.dialog.params
        if (!params.value) {
          Message.error('回复信息不能为空')
          return
        }
        // 成功
        this.dialogHide()
        Message.success('操作成功')
      },
      change (value) {
        this.params.page = value
        /*
         * todo：
         * 1.获取数据
         */
      },
    },
  }
</script>

<style lang="scss">
  .question-detail-view {
    display: flex;

    .question-left {
      padding: 15px 20px 15px 15px;
      flex: 1;

      .action {
        margin-top: 30px;
        display: flex;
        align-items: center;
        padding-bottom: 15px;
        @apply border-b border-solid border-gray-light;

        button {
          border: 0;
        }

        .icon-num {
          width: 18px;
          height: 18px;
          margin-left: 15px;
          margin-right: 5px;
          @apply fill-theme-color;
        }

        .total {
          @apply text-gray-darker;
        }
      }

      .list {
        padding-left: 45px;
        padding-top: 15px;
      }

      .list-item {
        margin-bottom: 30px;
      }

      .reply {
        padding: 4px 15px;
        @apply text-base;
      }
    }

    .question-right {
      padding: 15px;
      margin-left: 5px;
      width: 300px;

      .table-title {
        display: flex;
        margin-bottom: 10px;

        .text {
          line-height: 20px;
          flex: 1;
        }

        .table-views {
          @apply text-sm text-red;
        }

        .icon-view {
          width: 12px;
          height: 15px;
        }

        .icon-eval {
          width: 38px;
          height: 14px;
          margin-left: 7px;
        }

        .icon-fire {
          width: 12px;
          height: 15px;
        }

        .title-left {
          display: flex;
          height: 20px;
          align-items: center;
          margin-left: 20px;
        }
      }
    }
  }
</style>
