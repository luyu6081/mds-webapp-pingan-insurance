<template>
  <div class="home-view">
    <div class="hImg">
      <img src="@/assets/home/illustration.png" class="mx-auto">
      <h1>因数而动，智赢未来</h1>
    </div>

    <div class="hSearch">
      <ej-search-input v-model="searchCon"
                       clearable
                       @search="search"/>
    </div>

    <div class="hContent">
      <home-list title="我收藏的数据" :title-bg="require('@/assets/home/hi1.png')" :data="(homeLists || {}).favorites"/>
      <home-list title="订阅变动数据" :title-bg="require('@/assets/home/hi2.png')" :data="(homeLists || {}).updates"/>
      <home-list title="近期浏览的数据" :title-bg="require('@/assets/home/hi3.png')" :data="(homeLists || {}).visited"/>
      <home-list title="猜你喜欢的数据" :title-bg="require('@/assets/home/hi4.png')" :data="(homeLists || {}).recommended"/>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {Input} from 'element-ui'

  import {SearchInput as EjSearchInput} from '@ej/ui'

  import QUERY_HOME_LISTS from '@/graphql/home-lists.gql'
  import HomeList from './home-list.vue'

  Vue.use(Input)

  export default {
    name: 'HomeView',

    components: {
      EjSearchInput,
      HomeList,
    },

    data () {
      return {
        searchCon: '',
        lists: [],
      }
    },

    apollo: {
      homeLists: {
        query: QUERY_HOME_LISTS,
        fetchPolicy: 'network-only',
        update (data) {
          if (data.homeLists) {
            let favorites = data.homeLists.favorites
            let updates = data.homeLists.updates
            let visited = data.homeLists.visited
            let recommended = data.homeLists.recommended

            // 最多展示5条
            data.homeLists.favorites = favorites && favorites.length > 5 ? favorites.slice(0, 5) : favorites
            data.homeLists.updates = updates && updates.length > 5 ? updates.slice(0, 5) : updates
            data.homeLists.visited = visited && visited.length > 5 ? visited.slice(0, 5) : visited
            data.homeLists.recommended = recommended && recommended.length > 5 ? recommended.slice(0, 5) : recommended
          }
          return data.homeLists
        },
      },
    },

    methods: {
      search () {
        this.searchCon = this.searchCon.trim()
        if (this.searchCon) {
          this.$router.push({name: 'search', query: {s: this.searchCon}})
        } else {
          this.searchCon = ''
        }
      },
    },
  }
</script>

<style lang="scss">
  @import '../../style/variables';
  @import './variables.scss';

  .home-view {
    width: $page-width-default;
    margin-left: auto;
    margin-right: auto;
    padding: 20px 0 40px;
    border-radius: 2px;

    .hImg {
      height: 160px;
      width: 100%;
      text-align: center;

      h1 {
        font-weight: 300;
        margin: -20px 0 0;
        @apply text-2xl;
      }
    }

    .hSearch {
      margin: 29px 0 80px;
      text-align: center;

      .el-input {
        width: 552px !important;
        height: 40px;
        @apply text-blue;
      }

      .el-input__inner {
        border-radius: 20px;
        height: inherit;
        &:hover {
          box-shadow: 0px 1px 8px 2px rgba(140, 171, 232, 0.3);
        }
        &:focus {
          @apply border-blue;
        }
      }

      .ej-app-search__button {
        width: 20px;
        height: 20px;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translate(-50%, -50%);
      }
    }

    .search-btn {
      width: 20px;
      height: 20px;
      fill: #c2c2c2;
      cursor: pointer;
      margin-top: 50%;
      transform: translateX(-50%);
    }

    .hContent {
      padding: 0 ($page-width-default - $list-width * 4) / 10;
      min-height: 400px;
      display: flex;
    }
  }
</style>
