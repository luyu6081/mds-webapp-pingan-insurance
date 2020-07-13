<template>
  <div class="question-details__item">
    <header class="item__header">
      <div class="title">
        <img :src="user.avatar" class="photo">
        <h5>{{user.name}}</h5>
      </div>
      <span>{{data.time}}</span>
    </header>
    <p class="item__content">{{content}}</p>
    <div class="reply">
      <span @click="replyClick">回复</span>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      data: {
        type: Object,
        default: () => ({}),
      },
    },

    computed: {
      id () {
        return this.data.id
      },
      user () {
        return this.data.user || {}
      },
      content () {
        return this.data.content
      },
    },

    methods: {
      replyClick () {
        this.$emit('replyClick', this.id)
      },
    },
  }
</script>

<style lang="scss">
  .question-details__item {
    margin-top: 20px;

    .item__header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;

      .title {
        display: flex;

        .photo {
          border-radius: 50%;
          width: 10px;
          height: 10px;
        }

        h5 {
          margin: 0 0 0 6px;
        }
      }
    }

    .item__content {
      white-space: initial;
      margin: 5px 0;
    }

    .reply {
      text-align: right;
    }
  }
</style>
