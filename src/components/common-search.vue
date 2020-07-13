<template>
  <div class="common-search">
    <div class="common-search-header">
      <el-input v-model="keywords.searchValue"
                :placeholder="searchPlaceholder"
                class="input-search"
                @keyup.enter.native="handleSearch">
        <ej-icon slot="suffix" icon="search" class="search-btn cursor-pointer" @click="handleSearch"/>

      </el-input>
    </div>
    <div class="common-search-content">
      <span v-if="filterPanel"
            class="search-filter-btn text-black"
            :class="{activeFilterBtn: isShowFilter}"
            @click="isShowFilter = !isShowFilter">
        <ej-icon icon="filter" class="common-icon"/>
        <span>过滤</span>
      </span>
      <el-tabs v-model="activeName" class="search-tabs" @tab-click="handleTabsClick">
        <!-- 过滤筛选条件 -->
        <transition @before-enter="filterBeforeEnter" @enter="filterEnter" @leave="filterLeave">
          <div v-show="isShowFilter" class="search-filter-content">
            <slot name="filterCondition"/>
          </div>
        </transition>
        <!-- 复选框筛选条件 -->
        <div class="checkbox-condition clearfix">
          <span class="match-total float-left">{{matchTotal}}</span>
          <div class="checkbox-list float-right">
            <slot name="fixedCondition"/>
          </div>
        </div>
        <el-tab-pane v-for="tabItem in tabList"
                     :key="tabItem.name"
                     :name="tabItem.name"
                     :label="tabItem.label"
                     class="first"/>
        <!-- Tab内置内容 -->
        <div class="common-search-content__inside">
          <!-- 私有块 -->
          <!-- <slot :name="tabItem.name"/> -->
          <!-- 共用块 -->
          <slot :data="tableList.data"/>
          <common-pagination background
                             :current-page="currentPage"
                             :page-size="tableList.pageSize"
                             :total="tableList.pageTotal"
                             @current-change="handleCurrentChange"/>
        </div>
      </el-tabs>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {Button, Input, Tabs, TabPane} from 'element-ui'

  import {Icon} from '@ej/ui'

  import CommonPagination from '@/common-components/pagination'

  Vue.use(Button)
  Vue.use(Input)
  Vue.use(Tabs)
  Vue.use(TabPane)

  Vue.use(Icon)

  Vue.use(CommonPagination)

  export default {
    name: 'CommonSearch',

    props: {
      keyword: String,
      matchTotal: {
        type: String,
        default: '共检索0条数据',
      },
      searchPlaceholder: {
        type: String,
        default: '请输入内容',
      },
      filterPanel: {
        type: Boolean,
        default: false,
      },
      tableList: Object,
      tabList: Array,
      pageNumber: {
        type: Number,
        default: 1,
      },
    },

    model: {
      prop: 'pageNumber',
      event: 'current-change',
    },

    data () {
      return {
        keywords: {
          searchValue: this.keyword,
        },
        activeName: 'first',
        isShowFilter: false,
      }
    },

    computed: {
      currentPage: {
        get () {
          return this.pageNumber
        },
        set (val) {
          this.$emit('current-change', val)
        },
      },
    },

    methods: {
      filterBeforeEnter (el) {
        el.style.height = 0
      },
      filterEnter (el) {
        el.style.height = el.scrollHeight !== 0 ? el.scrollHeight + 'px' : 0
      },
      filterLeave (el) {
        el.style.height = 0
      },
      handleTabsClick (tab) {
        this.$emit('search-tab-click', tab)
      },
      handleSearch () {
        this.$emit('search-input-click', this.keywords)
      },
      handleCurrentChange (val) {
        this.currentPage = val
        console.log(`当前页: ${val}`)
      },
    },
  }
</script>

<style lang="scss">
  .common-search {

    .el-tabs__header {
      margin: 0;
    }

    .el-breadcrumb .el-breadcrumb__separator {
      margin: 0 5px;
      font-weight: normal;
      @apply text-gray;
    }

    .el-tabs__nav {
      margin-left: 50px;
    }

    .input-search .el-input__inner {
      border-radius: 50px;
      @apply text-lg text-black;
    }

    &-content {
      .el-tabs__item {
        width: 110px;
        text-align: center;
        @apply text-lg text-black;
      }
      .el-tabs__item.is-active {
        @apply text-blue;
      }
      .el-tabs__nav-wrap::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        z-index: 1;
        @apply bg-gray-light;
      }
    }

    .search-filter-content,
    .checkbox-condition,
    // .common-search-content__inside,
    .common-search-header {
      padding: 0 50px
    }

    &-header {
      .search-btn {
        width: 20px;
        height: 20px;
        margin-top: 50%;
        transform: translateX(-50%);
      }
    }

    button {
      outline: none;
    }

    .el-pagination {
      text-align: right;
    }

    .common-icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      vertical-align: middle;
      margin-right: 5px;

      & + span {
        vertical-align: middle;
      }
    }

    .search-filter-btn {
      opacity: .65;
      line-height: 1.4;
      position: absolute;
      top: 8px;
      right: 300px;
      cursor: pointer;
      z-index: 1;
      user-select: none;
      padding: 1px 2px;
      @apply border border-solid border-transparent;
      @apply text-base;
    }

    .activeFilterBtn {
      @apply border border-solid border-gray-darker bg-gray-lighter rounded;
    }

    .search-filter-content {
      max-height: 42px;
      line-height: 42px;
      overflow: hidden;
      transition: all .3s ease-in-out;
      @apply border-b border-solid border-gray-light;
    }

    .common-search-content {
      position: relative;
      margin-top: 15px;
    }

    .checkbox-condition {
      padding-bottom: 11px;
      padding-top: 11px;
      @apply border-b border-solid border-gray-light;

      .match-total {
        line-height: 20px;
        @apply text-base text-gray-darker;
      }
    }

    .common-search-content__inside {
      margin-top: 12px;
    }

    .input-search {
      width: 552px;

      .el-button {
        border: none;
        margin-top: 2px;
        border-radius: 0 50px 50px 0;
        padding: 6px;
        @apply text-4xl text-gray;

        &:hover {
          @apply text-gray-dark;
        }
      }
    }
  }
</style>
