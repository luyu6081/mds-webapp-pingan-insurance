<template>
  <div v-if="visible" class="create-tag-view">
   <el-input  ref="saveTagInput"
              v-model="tagName"
              autocomplete="off"
              placeholder="写下标签"
              @keyup.native="handleSubmit"
              @blur="!tagName.trim() && $emit('change-visible')"/>
    <p class="text-red text-xs text-center">{{errorTip}}</p>
    <i class="new-tag-input-remove" @click="$emit('change-visible')"></i>
  </div>
</template>

<script>
  import {Input as ElInput} from 'element-ui'

  export default {
    name: 'CreateTagView',

    components: {
      ElInput,
    },

    props: {
      tagCategoryId: {
        type: [Number, String],
        default: '',
      },
      visible: {
        type: Boolean,
        default: false,
      },
      errorTip: {
        type: String,
        default: '',
      },
    },

    data () {
      return {
        tagName: '',
      }
    },

    watch: {
      visible (visible) {
        if (visible) {
          this.$nextTick(_ => {
            this.$refs.saveTagInput.$refs.input.focus()
          })
        } else {
          this.tagName = ''
        }
      },
    },

    updated () {
      if (!this.visible) {
        this.tagName = ''
      }
    },

    methods: {
      /**
       * 新增标签
       */
      handleSubmit (e) {
        const tagForm = {
          tagName: this.tagName,
          tagCategoryId: this.tagCategoryId,
        }

        this.$emit('add-tag', tagForm, e)
      },

      handleBlur () {
        this.$emit('change-visible')
      },
    },
  }
</script>

<style lang="scss">
  .create-tag-view {
    @apply absolute bg-white z-30 rounded px-3 shadow py-1;

    width: 160px;
    height: 60px;
    left: -68px;

    &::before {
      @apply block w-0 h-0 absolute;

      content: '';
      border: 5px solid transparent;
      top: -10px;
      left: 76px;
    }

    .new-tag-input-remove {
      width: 12px;
      height: 12px;
      position: absolute;
      right: 7px;
      top: 7px;
      cursor: pointer;
      background: url('../../../../assets/icons/tab-input-remove.svg') no-repeat center;
    }

    .el-input__inner {
      border: none;
      border-bottom: 1px solid theme('colors.blue.default');
      border-radius: 0;
      height: 36px;
      line-height: 36px;
    }
  }
</style>
