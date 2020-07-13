<template>
  <div class="question-details">
    <header class="question-details__header">
      <img :src="user.avatar" class="photo">
      <h3>{{title}}</h3>
    </header>

    <p class="question-details__content">{{content}}</p>

    <CommentItem v-for="item in comments" :key="item.id" :data="item"/>
  </div>
</template>

<script>
  import QUERY_DETAILS_DATA from '@/graphql/question-details.gql'
  import CommentItem from './comment-item'

  export default {
    name: 'QuestionItem',

    components: {
      CommentItem,
    },

    props: {
      detailId: {
        type: [Number, String],
        default: '',
      },
    },

    data () {
      return {
        data: {},
      }
    },

    apollo: {
      // $client: 'localClient',
      data: {
        query: QUERY_DETAILS_DATA,
        variables () {
          return {
            mdsObjectId: this.detailId,
          }
        },
        fetchPolicy: 'network-only',
        skip () {
          return !this.detailId
        },
        update: data => data.dataDetails,
      },
    },

    computed: {
      id () {
        return this.data.id
      },
      title () {
        return this.data.title || ''
      },
      content () {
        return this.data.content || ''
      },
      comments () {
        return this.data.comments || []
      },
      user () {
        return this.data.user || {}
      },
    },
  }
</script>

<style lang="scss">
  .detail-view__question-panel .question-details {
    padding-right: 20px;

    &__header {
      display: flex;
      align-items: center;
      padding-right: 30px;

      .photo {
        border-radius: 50%;
        width: 25px;
        height: 25px;
      }

      h3 {
        margin-left: 10px;
      }

      .back-btn {
        cursor: pointer;
      }
    }

    &__content {
      white-space: initial;
    }
  }
</style>
