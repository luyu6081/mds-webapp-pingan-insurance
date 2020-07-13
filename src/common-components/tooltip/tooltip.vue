<template>
  <el-tooltip effect="dark" :visible-arrow="false" placement="bottom-start">
    <template #content>{{text}}</template>
    <slot/>
  </el-tooltip>
</template>

<script>
  import Vue from 'vue'
  import {Tooltip} from 'element-ui'

  Vue.use(Tooltip)
  export default {
    name: 'ComTooltip',
    props: {
      text: {
        type: String,
      },
    },
  }
</script>

<style lang="scss" >
  /*问题：修改了所有的 tooltip*/
  .el-tooltip__popper.is-dark{
    @apply bg-white text-gray-dark;
    box-shadow: 0 0 6px rgba(0, 0, 0, .15);
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 4px 10px;
  }
</style>
