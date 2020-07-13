<template>
  <div class="common-tag clearfix" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave">
    <div class="float-left tag-item">
      <ComTooltip :text="name">
        <div slot="content" class="tooltip-content">{{name}}</div>
        <span class="tag-item-word">{{name}}</span>
      </ComTooltip>
    </div>

    <span class="float-left tag-count-btn bg-theme-color text-white">
      <i v-show="isVisibleCountNums" class="tag-count-nums">{{score}}</i>
      <i v-show="isVisibleAddBtn" class="tag-count-add" @click="handleAddCount"></i>
      <i v-show="isVisibleSubBtn" class="tag-count-sub" @click="handleSubCount"></i>
      <transition name="fade" @after-enter="fadeAnimation = false">
        <em v-show="fadeAnimation" class="fade-up text-theme-color">{{voted ? '+1': '-1'}}</em>
      </transition>
    </span>
    <i v-if="isShowRemoveBtn" class="tag-count-remove" @click="remove"></i>
  </div>
</template>

<script>
  import Vue from 'vue'

  import MessageUtil from '@/utils/message'
  import ComTooltip from '@/common-components/tooltip'

  Vue.use(ComTooltip)

  const REMOVE_CONFIRM_TEXT = {
    message: '此操作将永久删除该标签, 是否继续?',
    messageSuccessText: '删除成功',
    messageErrorText: '已取消删除',
  }

  export default {
    name: 'TagItem',

    props: {
      name: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      removable: {
        type: Boolean,
      },
      voted: {
        type: Boolean,
      },
    },

    data () {
      return {
        isVisibleRemoveBtn: false,
        isVisibleCountNums: true,
        isVisibleCountAdd: false,
        isVisibleCountSub: false,
        fadeAnimation: false,
      }
    },

    computed: {
      isVisibleAddBtn () {
        return this.isVisibleCountAdd && !this.voted
      },
      isVisibleSubBtn () {
        return this.isVisibleCountSub && this.voted
      },
      isShowRemoveBtn () {
        return this.isVisibleRemoveBtn && this.removable
      },
    },

    methods: {
      handleMouseenter () {
        if (this.voted) {
          this.isVisibleCountAdd = false
          this.isVisibleCountSub = true
        } else {
          this.isVisibleCountAdd = true
          this.isVisibleCountSub = false
        }
        this.isVisibleRemoveBtn = true
        this.isVisibleCountNums = false
        this.$emit('mouseenter')
      },

      handleMouseleave () {
        this.showCountNums()
        this.$emit('mouseleave')
      },

      remove () {
        MessageUtil.MessageBoxConfirm(
          REMOVE_CONFIRM_TEXT,
          () => {
            this.$emit('remove')
          },
        )
      },

      handleAddCount () {
        this.fadeAnimation = true
        this.showCountNums()
        this.$emit('score-change', 1)
      },

      handleSubCount () {
        this.fadeAnimation = true
        this.showCountNums()
        this.$emit('score-change', -1)
      },

      showCountNums () {
        this.isVisibleRemoveBtn = false
        this.isVisibleCountNums = true
        this.isVisibleCountAdd = false
        this.isVisibleCountSub = false
      },
    },
  }
</script>

<style lang="scss" scoped>

  .tag-item-popper .tooltip-content {
    max-width: 200px;
    line-height: 18px;
    word-wrap: break-word;
    word-break: break-all;
  }

  .common-tag {
    position: relative;
    margin-bottom: 8px;

    &:hover {
      .tag-item {
        @apply text-theme-color;
      }
    }

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
        background: url('../../assets/icons/tag-arrows.svg') no-repeat center;
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
        background: url('../../assets/icons/tag-remove.svg') no-repeat center;
      }

      &-add {
        height: 24px;
        background: url('../../assets/icons/tag-item-add-bg.svg') no-repeat center;
      }

      &-sub {
        height: 24px;
        background: url('../../assets/icons/tag-item-sub-bg.svg') no-repeat center;
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
