<template>
  <div class="questions-view">
    <!--左边问题搜索列表............................start-->
    <div class="bg-white qContent-left">
      <common-search :search-placeholder="searchPlaceholder"
                     :table-list="searchResults"
                     :tab-list="tabList"
                     :match-total="matchTotal"
                     :filter-panel="false"
                     :checked-list="checkedList"
                     :checkbox-group="checkboxGroup"
                     class="questions-view__search"
                     @search-tab-click="handleTabsClick"
                     @search-input-click="handleSearch">

        <!-- 结果列表 -->
        <div class="search-content">
          <div v-for="item in searchResults.lists" :key="item.id" class="qlist py-2 px-6 mx-1">
            <div class="qtitle">
              <div class="info-img">
                <div v-if="item.img" class="img" :style="{backgroundImage: `url(${item.img})`}"></div>
                <img v-else src="@/assets/icon-account.svg" alt class="img img-def"/>
              </div>
              <div class="qth text-black">{{item.title}}</div>
              <div class="time">{{item.time}}</div>
            </div>
            <div class="qdesc">
              <p class="dh">{{item.desc}}</p>
              <router-link :to="{name: 'question-detail', params: {questionId: item.id}}"
                           class="more">阅读全文</router-link>
            </div>
            <div class="qtable">
              <router-link :to="{name: 'detail', params: {tableId: item.table.id}}" class="table">
                {{item.table.name}}
              </router-link>
              <div class="qcimg">
                <img src="../../assets/question/q2.png">
                <span class="count">{{item.count}}</span>
              </div>
              <img src="../../assets/question/q1.png" alt class="qquaimg">
              <div class="qreply">
                <img src="../../assets/question/q3.png">
                <span class="qcount">{{item.reply}}条</span>
              </div>
            </div>
          </div>
        </div>
      </common-search>
    </div>
    <!--左边问题搜索列表..............................end-->

    <!--右边更多问题................................start-->
    <div class="bg-white qContent-right">
      <el-button type="primary" @click="openQuesDialog" class="buttomon">
        <div class="button-h">
          <img width="17" height="22" src="../../assets/question/q4.png">&nbsp;&nbsp;写问题
        </div>
      </el-button>

      <h3 class="hdescribe">提问较多的元数据</h3>

      <ol class="olcl">
        <router-link tag="li"
                     v-for="item in searchResults.mdata"
                     :key="item.id"
                     :to="{name: 'question-detail', params: {questionId: item.id}}">
          <span class="dth">{{item.table}}</span>
          <span class="count">
            <img src="../../assets/question/q3.png" alt>
            <span class="num">{{item.count}}条</span>
          </span>
        </router-link>
      </ol>
    </div>
    <!--右边更多问题..................................end-->

    <!--填写问题遮罩框..............................start-->
    <el-dialog
      :visible.sync="dialogVisible"
      width="864px"
      height="402px">
      <div class="dialog-ques">
        <div class="dialog-title">
          <div class="circle"></div>
          <div class="dialog-input">
            <el-input v-model="fillData.title" placeholder="请输入问题标题"/>
          </div>
        </div>
        <div class="dialog-body">
          <ej-text-editor v-model="fillData.content" :placeholder="writerPlaceholder" :rows="11"/>
        </div>
        <div class="dialog-explan">可以通过特殊符号表示特殊意义 ，比如@，可以抄送某人 # 可以引入系统名称 &表名等</div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="fillQuestion">提 交</el-button>
      </span>
    </el-dialog>
    <!--填写问题遮罩框................................end-->
  </div>
</template>

<script>
  import {
    Dialog as ElDialog,
    Button as ElButton,
    Input as ElInput,
  } from 'element-ui'

  import {TextEditor as EjTextEditor} from '@ej/ui'

  import CommonSearch from '@/components/common-search.vue'

  export default {
    name: 'questionsView',

    components: {
      CommonSearch,
      ElDialog,
      ElButton,
      ElInput,
      EjTextEditor,
    },

    data () {
      return {
        fromSource: {
          category: 'categorySearch',
          home: 'homeSearch',
        },
        searchPlaceholder: '会员信息',
        writerPlaceholder: '请输入问题',
        tabList: [{
          name: 'first',
          label: '全部信息',
        }, {
          name: 'second',
          label: '我参与的',
        }, {
          name: 'third',
          label: '@我的',
        }],
        checkedList: ['元数据描述完整'],
        checkboxGroup: ['元数据描述完整', '最近1个月更新', '临时表'],
        searchResults: {},
        dialogVisible: false,
        fillData: {
          title: '',
          content: '',
        },
      }
    },

    computed: {
      matchTotal () {
        return '共' + this.searchResults.amount + '条检索数据'
      },
    },

    created () {
      this.queryData()
    },

    methods: {
      handleTabsClick (tab) {
        console.log('tab', tab)
      },
      handleSearch (keywords) {
        console.log('keywords', keywords)
      },
      queryData () {
        this.searchResults = require('../../../static/data/questions/questions.json')
      },
      handleCheckedChange (checkedVal) {
        console.log('checkedVal', checkedVal)
      },
      handleCurrentChange (val) {
        console.log(`当前页: ${val}`)
      },
      openQuesDialog () {
        this.dialogVisible = true
      },
      fillQuestion () {
        console.log('填写问题标题：' + this.fillData.title)
        console.log('填写问题内容：' + this.fillData.content)
        this.dialogVisible = false
      },
    },
  }
</script>

<style lang="scss">

  .questions-view {
    display: flex;

    $aside-width: 300px;
    $column-gap: 7px;

    .qContent-left {
      max-width: calc(100% - #{$aside-width + $column-gap});
      flex: auto;
    }

    .qContent-right {
      padding: 7px 0;
      flex: none;
      width: $aside-width;
      margin-left: 7px;
      display: flex;
      flex-direction: column;

      .buttomon {
        margin: 0 14px;
        border: 0;
        @apply bg-theme-color;

        .button-h {
          display: flex;
          justify-content: center;
          align-items: Center;
        }
      }

      .hdescribe {
        line-height: 1.4;
        margin: 17px 0 6px 14px;
        @apply text-base text-gray-darkest;
      }

      .olcl {
        list-style: none;
        counter-reset: top-questions;
        padding: 0 14px 0 0;
        margin: 0 0 0 14px;
        @apply border-t border-solid border-gray-light;

        li {
          counter-increment: top-questions;
          margin: 8px 0;
          line-height: 1.4;
          cursor: pointer;
          display: flex;
          flex-wrap: nowrap;
          @apply text-base;

          &::before {
            content: counter(top-questions) '.';
            flex: none;
          }

          .dth {
            line-height: 1.4;
            flex: auto;
            @apply text-gray-darkest;
          }

          .count {
            flex: none;

            img {
              margin-right: 5px;
              vertical-align: middle;
            }

            .num {
              vertical-align: middle;
              @apply text-gray-darker;
            }
          }

          &:hover {
            @apply text-theme-color;

            .dth,
            .num {
              @apply text-theme-color;
            }
          }
        }
      }
    }

    &__search {
      padding: 20px 0;

      .search-content {
        .qlist {
          margin: 18px 0;
          &:hover {
            @apply rounded;

            transition: .3s;
            box-shadow: 0px 1px 8px 2px rgba(140, 171, 232, 0.3);
          }
        }

        $padding-left: 29px;
        $avatar-size: 24px;

        .qtitle {
          margin-bottom: 5px;
          display: flex;
          flex-wrap: nowrap;
          align-items: center;

          .circle {
            width: $avatar-size;
            height: $avatar-size;
            @apply bg-gray-light;
            border-radius: 50%;
            flex: none;
            margin-right: $padding-left - $avatar-size;
          }

          .info-img {
            width: $avatar-size;
            height: $avatar-size;
            border-radius: 50%;
            overflow: hidden;
            flex: none;
            margin-right: $padding-left - $avatar-size;

            .img {
              width: 100%;
              height: 100%;
              background-size: cover;
            }
          }

          .qth {
            flex: none;
            @apply text-lg;
          }

          .time {
            flex: none;
            margin-left: auto;
            @apply text-base text-gray-dark;
          }
        }

        .qdesc {
          line-height: 1.4;
          margin-bottom: 6px;
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          padding-left: $padding-left;

          .dh {
            flex: auto;
            margin: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            @apply text-gray-dark;
          }

          .more {
            font-weight: bold;
            cursor: pointer;
            flex: none;
            @apply text-base text-theme-color;
          }
        }

        .qtable {
          line-height: 1.4;
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          margin-left: $padding-left;
          @apply text-base;

          > * {
            flex: none;
          }

          .table {
            @apply text-theme-color;
          }

          .qcimg {
            margin-left: 19px;

            > * {
              vertical-align: middle;
            }

            .count {
              @apply text-sm text-red;
              margin-left: 3px;
            }
          }

          .qquaimg {
            margin-left: 10px;
          }

          .qreply {
            margin-left: auto;

            > * {
              vertical-align: middle;
            }

            .qcount {
              margin-left: 5px;
              @apply text-gray-darker;
            }
          }
        }
      }
    }

    .el-dialog__body {
      padding: 0 30px 0 20px;
    }

    .el-dialog__footer {
      padding: 10px 30px 20px;
      text-align: right;
      box-sizing: border-box;
    }

    .dialog-ques {
      height: 340px;

      .dialog-title {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;

        .dialog-input {
          margin-left: 10px;

          .el-input {
            width: 456px;
            @apply text-theme-color;
          }

          .el-input__inner {
            height: 28px;
            border-radius: 4px;
            @apply border border-solid border-gray;
            @apply text-base;
          }

        }
      }

      .dialog-body {
        margin: 10px 0 0 32px;
      }

      .dialog-explan {
        margin: 10px 0 0 32px;
        @apply text-base text-gray-darker;
      }
    }
  }
</style>
