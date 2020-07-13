<template>
  <div class="common-tag clearfix">
    <div class="float-left tag-item">
      <ComTooltip :text="name">
        <span class="tag-item-word">{{name}}</span>
      </ComTooltip>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'

  import ComTooltip from '@/common-components/tooltip'

  Vue.use(ComTooltip)

  export default {
    name: 'TagComp',

    props: {
      name: {
        type: String,
        required: true,
      },
    },
  }
</script>

<style lang="scss" scoped>
  .common-tag {
    @apply relative;

    .tag-item {
      border: none;
      min-width: 40px;
      height: 24px;
      line-height: 24px;
      position: relative;
      margin: 0 0 0 20px;
      padding: 0 4px;
      z-index: 2;
      border-radius: 0px 3px 3px 0px;
      @apply text-sm text-gray-darkest bg-blue-lighter;

      &-word {
        max-width: 160px;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &::before {
        content: '';
        display: block;
        position: absolute;
        width: 12px;
        height: 24px;
        left: -10px;
        top: 0;
        background: url('../../../../assets/icons/tag-arrows.svg') no-repeat center;
      }
    }

    i {
      font-style: normal;
      min-width: 16px;
      height: 24px;
      line-height: 24px;
      display: block;
      margin: 0 auto;
    }

    .tag-count {
      &-remove {
        width: 10px;
        height: 12px;
        z-index: 10;
        display: block;
        position: absolute;
        right: -5px;
        top: -5px;
        cursor: pointer;
        background: url('../../../../assets/icons/tag-remove.svg') no-repeat center;
      }

      &-add {
        height: 24px;
        background: url('../../../../assets/icons/tag-item-add-bg.svg') no-repeat center;
      }

      &-sub {
        height: 24px;
        background: url('../../../../assets/icons/tag-item-sub-bg.svg') no-repeat center;
      }

      &-btn {
        position: relative;
        margin-left: -2px;
        display: block;
        min-width: 20px;
        height: 24px;
        z-index: 1;
        border-top-right-radius: 4px;
        padding-right: 2px;
        line-height: 20px;
        text-align: center;
        padding-left: 2px;
        border-bottom-right-radius: 4px;
        cursor: pointer;
        @apply text-sm;
      }
    }

    .fade-up {
      position: absolute;
      top: -5px;
      right: 0;
      z-index: 2;
      opacity: 0;
      @apply text-sm font-semibold;
    }

    .fade-enter-active {
      animation: fade-up .5s;
    }

    .fade-leave-active {
      animation: fade-up .5s;
    }
  }

  @keyframes fade-up {
    0% {
      opacity: 0;
      transform: translateY(-5px) scale(.8);
    }
    25% {
      opacity: .5;
      transform: translateY(-9px) scale(.8);
    }
    50% {
      opacity: 1;
      transform: translateY(-13px) scale(.8);
    }
    75% {
      opacity: 1;
      transform: translateY(-17px) scale(.8);
    }
    100% {
      opacity: .5;
      transform: translateY(-21px) scale(.8);
    }
  }
</style>
