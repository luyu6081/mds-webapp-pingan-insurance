<template>
  <div class="comp-tag">
    <tag-item v-for="(tag, idx) in internalTags"
              :key="tag.name"
              v-bind="tag"
              @mouseenter="$emit('tag-mouseenter', {_index: idx, ...tag})"
              @mouseleave="$emit('tag-mouseleave', {_index: idx, ...tag})"
              @score-change="change => onTagScoreChange(idx, change)"
              @remove="removeTag(tag.id, idx)"/>

    <el-tooltip popper-class="tag-add-btn-popper" effect="dark" content="添加标签" placement="bottom">
      <a class="new-tag-button" @click="inputVisible = true"></a>
    </el-tooltip>

    <div v-if="inputVisible" class="bg-white new-tag-wrap">
      <el-input ref="saveTagInput"
                v-model="inputValue"
                placeholder="写下标签"
                size="small"
                class="new-tag-input"
                @keyup.native="validate"
                @blur="!inputTrimmed && (inputVisible = false)"/>
      <span class="error-tip">{{errorTip}}</span>
      <i class="new-tag-input-remove" @click="inputVisible = false"></i>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {Input, Tooltip} from 'element-ui'

  import TagItem from './tag-item.vue'

  Vue.use(Input)
  Vue.use(Tooltip)

  export default {
    name: 'CommonTagList',

    components: {
      TagItem,
    },

    model: {
      prop: 'tags',
      event: 'change',
    },

    props: {
      tags: {
        type: Array,
        default: () => [],
      },
    },

    data () {
      return {
        inputVisible: false,
        inputValue: '',
        errorTip: '',
      }
    },

    computed: {
      internalTags: {
        get () {
          return this.tags
        },
        set (val) {
          this.$emit('change', val)
        },
      },

      inputTrimmed () {
        return this.inputValue.trim()
      },
    },

    watch: {
      inputVisible (visible) {
        if (visible) {
          this.$nextTick(_ => {
            this.$refs.saveTagInput.$refs.input.focus()
          })
        } else {
          this.inputValue = ''
          this.errorTip = ''
        }
      },
    },

    methods: {
      removeTag (tagId, idx) {
        console.log('Tag to remove:', this.internalTags[idx])
        this.internalTags.splice(idx, 1)

        this.$emit('tag-remove', tagId)
      },

      onTagScoreChange (idx, change) {
        const tag = this.internalTags[idx]
        const newTag = {
          ...tag,
          score: tag.score + change,
          voted: change > 0 ? true : change < 0 ? false : tag.voted,
        }
        this.$set(this.internalTags, idx, newTag)

        const payload = {_index: idx, ...newTag}
        // istanbul ignore else
        if (change > 0) {
          this.$emit('tag-score-up', payload)
        } else if (change < 0) {
          this.$emit('tag-score-down', payload)
        }
      },

      validate (ev) {
        const found = this.inputTrimmed && this.internalTags.find(tag => tag.name === this.inputTrimmed)
        if (found) {
          this.errorTip = '标签已存在'
          return
        }

        this.errorTip = ''

        if (ev.key === 'Enter') {
          this.save()
        }
      },

      save () {
        if (!this.errorTip && this.inputTrimmed) {
          // this.internalTags.push({
          //   name: this.inputTrimmed,
          //   score: 1,
          //   voted: true,
          //   removable: true,
          // })
          this.$emit('tag-create', this.inputTrimmed)
        }

        this.inputVisible = false
      },
    },
  }
</script>

<style lang="css">
  .comp-tag .el-input__inner {
    border: none;
  }

  .tag-add-btn-popper {
    padding: 4px 6px;
    line-height: 1.2;
    min-width: 10px;
  }

  .tag-add-btn-popper.is-dark {
    @apply bg-blue-lighter text-blue;
    display: block;
  }

  .tag-add-btn-popper[x-placement^=bottom] .popper__arrow {
    top: -6px;
    @apply border-t-0 border-b bg-blue-lighter;
  }

  .tag-add-btn-popper[x-placement^=bottom] .popper__arrow::after {
    top: 1px;
    margin-left: -5px;
    @apply border-t-0 border-b bg-blue-lighter;
  }
</style>

<style lang="scss" scoped>

  .comp-tag {
    position: relative;
    flex-wrap: wrap;
    max-width: 230px;

    .error-tip {
      position: absolute;
      bottom: 4px;
      left: 26px;
      transform: scale(.8);
      @apply text-sm text-red;
    }

    .new-tag {
      &-button {
        margin-left: 10px;
        width: 14px;
        height: 14px;
        background: url('../../assets/icons/tag-add-btn.svg') no-repeat center;
        display: inline-block;
        vertical-align: top;
        margin-top: 4px;
      }

      &-input {
        width: 180px;
        vertical-align: bottom;
        margin: 0 auto;
        @apply border-0 border-b-2 border-solid border-blue-light;
      }

      &-input-remove {
        width: 12px;
        height: 12px;
        position: absolute;
        right: 7px;
        top: 7px;
        cursor: pointer;
        background: url('../../assets/icons/tab-input-remove.svg') no-repeat center;
      }

      &-wrap {
        position: absolute;
        right: 45%;
        width: 230px;
        padding: 16px 0 20px;
        text-align: center;
        border-radius: 2px;
        left: 50%;
        margin-left: -115px;
        bottom: -70px;
        @apply shadow-md;
      }
    }
  }
</style>
