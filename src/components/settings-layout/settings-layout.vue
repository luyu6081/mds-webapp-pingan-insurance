<template>
  <div class="setting-layout-view">
    <div v-if="layout === LayoutType.general" class="layout-general clearfix">
      <div class="float-left">
        <ej-search-input v-model="keywords" :width="searchInputWidth" :height="searchInputHeight" placeholder="请输入" @search="search"/>
      </div>
      <div class="float-right">
        <div :style="{height: searchInputHeight + 'px'}" class="buttons">
          <slot name="buttonArea"></slot>
        </div>
      </div>
    </div>
    <div v-if="layout === LayoutType.upgradeSelect" class="layout-upgradeSelect relative">
      <div class="w-full relative">
        <div v-show="isShowCondition" :style="{height: ejSearchListHeight}" class="bg-white w-full absolute z-20 opacity-75 cursor-not-allowed"></div>
        <ej-search-list ref="ejSearchList"
                        :models.sync="models"
                        app-key="MDS"
                        :view-id="viewId"
                        max-width-tag="350px"
                        @search="handleSearchList">

            <template #input>
              <ej-search-input v-model="keywords" @search="handleSearchList('btn')" placeholder="请输入搜索内容"/>
            </template>

            <template #default>
              <ej-search-option-list :no-multiple="true" prop="custom" v-model="models.custom" label="数据对象" :options="dataTypeList"/>
            </template>
        </ej-search-list>
      </div>
      <div class="right-button-area z-30">
        <div  :style="{height: searchInputHeight + 'px'}" class="buttons">
          <slot name="buttonArea"></slot>
        </div>
      </div>
    </div>
    <div v-if="layout === LayoutType.compoundSelect" class="layout-compoundSelect relative">
      <div class="w-full relative">
        <div v-show="isShowCondition" class="shade bg-white w-full absolute z-20 opacity-75 cursor-not-allowed"></div>
        <search-select :select-list="selectData" @search="search"/>
      </div>
      <div class="right-button-area z-30">
        <div :style="{height: searchInputHeight + 'px'}" class="buttons">
          <slot name="buttonArea"></slot>
        </div>
      </div>
    </div>
    <div class="main">
      <slot name="mainArea"></slot>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  import {SearchInput as EjSearchInput, SearchList as EjSearchList, SearchOptionList as EjSearchOptionList} from '@ej/ui'

  import SearchSelect from '@/components/search-select'

  const LayoutType = {
    general: 'GENERAL', // 单一搜索框
    compoundSelect: 'COMPOUND', // 搜索框 + 下拉框 复合搜索框
    upgradeSelect: 'UPGRADE', // 带[常用条件]的搜搜框
  }

  export default {
    name: 'SettingsLayout',

    components: {
      EjSearchOptionList,
      EjSearchList,
      EjSearchInput,

      SearchSelect,
    },

    props: {
      layout: { // 布局模式
        type: String,
        default: LayoutType.general,
      },
      searchInputWidth: { // 搜索框的宽度
        type: [String, Number],
        default: 440,
      },
      searchInputHeight: { // 搜索框的高度
        type: [String, Number],
        default: 40,
      },
      dataTypeList: {
        type: Array,
        default: () => [],
      },
      viewId: {
        type: Number,
        default: 0,
      },
      searchSelectedBusi: { // 搜索框组件 外部条件
        type: Array,
        default: () => [],
      },
      isShowCondition: { // 是否禁用搜索条件
        type: Boolean,
        default: false,
      },
    },

    model: {
      prop: 'searchSelectedBusi',
      event: 'change',
    },

    data () {
      return {
        keywords: '',

        models: {
          custom: [],
          busiList: [],
        },

        ejSearchListHeight: '50px',

        selectData: [],
      }
    },

    computed: {
      ...mapGetters({
        techTree: 'techTree',
      }),

      LayoutType: () => LayoutType,

      externalCondition: {
        get () {
          return this.searchSelectedBusi
        },

        set (val) {
          this.$emit('change', val)
        },
      },
    },

    watch: {
      'models.busiList': {
        deep: true,
        handler (val = []) {
          this.emitSetSelected({
            key: 'busiList',
            label: val.length ? `业务类目：${val.map(item => item.name).join(',')}` : '',
          })

          this.externalCondition = val
        },
      },
      externalCondition: {
        deep: true,
        handler (val) {
          this.models.busiList = this.externalCondition
        },
      },
      techTree: {
        immediate: true,
        handler (val) {
          this.selectData = val
        },
      },
    },

    updated () {
      if (this.$refs.ejSearchList) {
        this.ejSearchListHeight = (this.$refs.ejSearchList.$el.offsetHeight || 0) + 'px'
      }
    },

    methods: {
      emitSetSelected (...args) {
        return this.$refs.ejSearchList.emitSetSelected(...args)
      },
      search (arg) {
        this.$emit('search', arg)
      },
      handleSearchList (type) {
        this.$emit('search', type, {keywords: this.keywords, ...this.models})
      },
    },
  }
</script>

<style lang="scss">
  .setting-layout-view {
    .main {
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

      .el-button--text {
        @apply tracking-widest;

        padding: 0;
      }
    }

    // 基础布局
    .layout-general {

    }

    .layout-compoundSelect {
      .right-button-area {
        @apply absolute right-0 top-0;
      }
      .shade {
        height: 44px;
        width: 405px;
        border-radius: 20px;
      }
    }

    .layout-upgradeSelect {
      .ej-search-list .ej-search-commonly-select {
        width: 100px;
      }
      .data-object-item {
        @apply mx-6 cursor-pointer;

        &:hover {
          @apply text-blue;
        }
      }
      .right-button-area {
        @apply absolute right-0 top-0;
      }
      .ej-search-list {
        .ej-search-input {
          width: 200px !important;
          height: 34px !important;
          margin-right: 300px;
        }
      }
    }

    .buttons {
      @apply flex items-end;

      height: 40px;
      padding-bottom: 3px;

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
  }
</style>
