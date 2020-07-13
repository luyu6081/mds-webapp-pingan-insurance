<template>
  <div class="question-item">
    <img :src="user.avatar" class="photo">
    <dl class="info">
      <dt>{{data.title}}</dt>
      <dd><i class="el-icon-chat-dot-round"></i>{{replyNum}}</dd>
    </dl>
  </div>
</template>

<script>
  export default {
    name: 'QuestionItem',

    props: {
      data: {
        type: Object,
        default: () => ({}),
      },
    },

    computed: {
      replyNum () {
        const replyNum = this.data.replyNum || 0
        return `${replyNum}条`
      },
      user () {
        return this.data.user || {}
      },
    },
  }
</script>

<style lang="scss">
  .detail-view__question-panel .question-item {
    display: flex;
    align-items: center;
    padding-right: 20px;
    cursor: pointer;

    .photo {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      overflow: hidden;
    }

    .info {
      flex: 1;
      margin: 0 0 0 10px;
      display: flex;
      justify-content: space-between;
      font-size: 14px;

      dd {
        margin: 0;
      }

      .el-icon-chat-dot-round {
        font-size: 16px;
        color: #477DE9;
      }
    }
  }
</style>
