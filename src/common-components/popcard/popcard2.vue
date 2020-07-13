<template>
  <el-popover trigger="hover">
    <template #reference><slot/></template>

    <header class="popcard-header">
      <i class="popcard-header__icon"></i>
      <span class="popcard-header__title">{{title}}</span>
      <div class="popcard-header__buttons">
        <i class="el-icon-message"></i>
      </div>
    </header>
    <slot name="popcard"/>
  </el-popover>
</template>

<script>
  import {Popover} from 'element-ui'

  export default {
    name: 'CommonPopcard2',

    components: {
      ElPopover: Popover,
    },

    props: {
      title: {
        type: String,
        required: true,
      },
    },
  }
</script>

<style lang="scss" scoped>
  .popcard-header {
    display: flex;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 12px;

    > * {
      flex: none;
    }

    &__icon {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      background: #ccc;
      margin-right: 10px;
    }

    &__title {
      display: inline-block;
    }

    &__buttons {
      margin-left: auto;
    }
  }
</style>
