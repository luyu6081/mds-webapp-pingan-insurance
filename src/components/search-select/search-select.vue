<template>
  <div class="search-select-view">
    <ej-search-select v-model="keywords" width="400" @search="search">
      <template #prepend>
        <el-cascader  v-model="select"
                      :props="{label: 'name', value: 'id'}"
                      :options="selectList"
                      clearable
                      placeholder="请选择"
                      @change="handleChange"></el-cascader>
      </template>
    </ej-search-select>
  </div>
</template>

<script>
  import {
    Cascader as ElCascader,
  } from 'element-ui'

  import {
    SearchSelect as EjSearchSelect,
  } from '@ej/ui'

  export default {
    name: 'SearchSelect',

    components: {
      ElCascader,

      EjSearchSelect,
    },

    props: {
      searchInputWidth: { // 搜索框的宽度
        type: [String, Number],
        default: 440,
      },
      selectList: {
        type: Array,
        default: () => [],
      },
    },

    data () {
      return {
        keywords: '',
        select: '',
      }
    },

    methods: {
      search (arg) {
        this.$emit('search', {select: this.select, keywords: this.keywords})
      },
      handleChange (arg) {
        this.$emit('search', {select: this.select, keywords: this.keywords})
      },
    },
  }
</script>

<style lang="scss">
  .search-select-view {
    .el-cascader {
      height: 36px;
      line-height: 36px;
      .el-input {
        height: 34px;
        line-height: 34px;

        .el-input__inner {
          border: none;
          border-top-left-radius: 20px;
          border-bottom-left-radius: 20px;
          padding: 0 15px;
          padding-right: 25px;
          height: 32px;
        }
      }
    }
    .input-with-select {
      width: 350px;
      .el-input-group__prepend {
        @apply bg-white;

        height: 36px;

        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
        padding: 0 10px;
        padding-right: 0;
      }
      .el-input-group__append {
        padding: 0 12px;
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
      }
    }
  }
</style>
