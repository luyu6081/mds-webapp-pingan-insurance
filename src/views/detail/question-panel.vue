<template>
  <aside class="detail-view__question-panel area aside flex vertical">
    <section class="question-panel__editor flex-item solid">
      <h2>我要提问</h2>

      <ej-text-editor class="text-editor"/>

      <div class="buttons">
        <el-button size="small">取消</el-button>
        <el-button size="small" type="primary">提交</el-button>
      </div>
    </section>
    <section class="question-panel__list flex-item">
      <h2>相关提问</h2>
      <!-- <question-list/> -->
    </section>
  </aside>
</template>

<script>
  import Vue from 'vue'
  import {Button} from 'element-ui'

  import {TextEditor as EjTextEditor} from '@ej/ui'

  // import QuestionList from './question-list.vue'

  Vue.use(Button)

  export default {
    name: 'QuestionPanel',

    components: {
      // QuestionList,
      EjTextEditor,
    },
  }
</script>

<style lang="scss">
  @import './variables.scss';

  .detail-view__question-panel {
    display: flex;
    flex-direction: column;
    @apply bg-white;

    h2 {
      font-weight: bold;
      line-height: 1.4;
      margin: 10px 14px;
      @apply text-base;
    }

    .text-editor {
      margin: 14px;
    }

    .buttons {
      margin: 14px;
      text-align: right;
    }

    .question-panel__list {
      h2 {
        font-size: 14px;
        margin: 0 0 0 14px;
        padding: 10px 0;
        @apply border-b border-solid border-gray-lighter;
      }
    }
  }
</style>
