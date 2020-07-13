<template>
  <ul class="question-list">
    <div v-show="!showDetail" class="question-wrapper">
      <QuestionItem v-for="q of data"
                    :key="q.id"
                    :data="q"
                    class="item"
                    @click.native="goDetail(q.id)"/>
    </div>

    <QuestionDetails v-show="showDetail" :detailId="detailId" class="details"/>

    <span v-show="showDetail" class="back-btn" @click="backClick">返回</span>
  </ul>
</template>

<script>
  import QUERY_LIST from '@/graphql/question-list.gql'
  import QuestionItem from './question-item.vue'
  import QuestionDetails from './question-details.vue'

  export default {
    name: 'QuestionList',

    components: {
      QuestionItem,
      QuestionDetails,
    },

    data () {
      return {
        data: [],
        detailId: '',
        showDetail: false,
      }
    },

    apollo: {
      // $client: 'localClient',
      data: {
        query: QUERY_LIST,
        update: data => data.dataDetails,
      },
    },

    methods: {
      goDetail (id) {
        this.detailId = id
        this.showDetail = true
      },

      backClick () {
        this.showDetail = false
      },
    },
  }
</script>

<style lang="scss">
  .detail-view__question-panel .question-list {
    list-style: none;
    position: relative;
    padding-left: 10px;

    & > .question-wrapper > .item {
      margin-bottom: 10px;
    }

    & > .details {
      min-height: 100%;
    }

    & > .back-btn {
      position: absolute;
      right: 20px;
      top: 0;
      cursor: pointer;
    }
  }
</style>
