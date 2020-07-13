import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'

import {useApollo} from '@/vue-apollo'
import {GetTreeNode} from '@/utils/tools'

import QUERY_CATEGORIES_LISTS from '@/graphql/categories_lists_new_interface.gql'
import search from './modules/search'

Vue.use(Vuex)

const $apollo = useApollo()
const bodyOnly = /[?&]body_only([=&]|$)/.test(location.hash)
const datasourcesOnly = /[?&]datasources_only([=&]|$)/.test(location.hash)

export const Mutation = {}

export default new Vuex.Store({
  modules: {
    search,
  },

  state: {
    categories: [
      {id: 'tech', childern: []},
      {id: 'busi', childern: []},
    ],
    originalCategories: [
      {id: 'tech', data: []},
      {id: 'busi', data: []},
    ],
    userData: {},
    bodyOnly,
    datasourcesOnly,
  },

  getters: {
    userData (state) {
      return state.userData
    },
    categories (state) {
      return state.categories
    },
    techTree (state) {
      return state.categories.find(c => c.id === 'tech').childern || []
    },
    busiTree (state) {
      return state.categories.find(c => c.id === 'busi').childern || []
    },
    techOriginal (state) {
      return state.originalCategories.find(c => c.id === 'tech').data || []
    },
    busiOriginal (state) {
      return state.originalCategories.find(c => c.id === 'busi').data || []
    },
  },

  mutations: {
    [Mutation.setUserInfo = 'setUserInfo'] (state, data) {
      state.userData = data
    },
    [Mutation.setTechCategoriesTree = 'setTechCategoriesTree'] (state, data) {
      state.categories.map(c => {
        if (c.id === 'tech') {
          c.childern = data
        }
      })
    },
    [Mutation.setBusiCategoriesTree = 'setBusiCategoriesTree'] (state, data) {
      state.categories.map(c => {
        if (c.id === 'busi') {
          c.childern = data
        }
      })
    },
    [Mutation.setTechCategoriesOriginal = 'setTechCategoriesOriginal'] (state, data) {
      state.originalCategories.map(c => {
        if (c.id === 'tech') {
          c.data = data
        }
      })
    },
    [Mutation.setBusiCategoriesOriginal = 'setBusiCategoriesOriginal'] (state, data) {
      state.originalCategories.map(c => {
        if (c.id === 'busi') {
          c.data = data
        }
      })
    },
  },
  actions: {
    async categoriesTechList ({commit}) {
      const _techData = await $apollo.query({
        query: QUERY_CATEGORIES_LISTS,
        fetchPolicy: 'no-cache',
        variables: {
          input: {
            type: 'TECHONLOGY',
            status: 'AVAILABLE',
          },
        },
      })

      if (_techData.data.categoriesLists) {
        // 技术类目加入tree
        let copyObj = _.cloneDeep(_techData.data.categoriesLists).filter(od => od)
        commit('setTechCategoriesOriginal', _techData.data.categoriesLists)
        commit('setTechCategoriesTree', GetTreeNode(copyObj))
      }
    },
    async categoriesBusiList ({commit}) {
      const _busiData = await $apollo.query({
        query: QUERY_CATEGORIES_LISTS,
        fetchPolicy: 'no-cache',
        variables: {
          input: {
            type: 'BUSINESS',
            status: 'AVAILABLE',
          },
        },
      })
      if (_busiData.data.categoriesLists) {
        // 业务类目加入tree
        let copyObj = _.cloneDeep(_busiData.data.categoriesLists).filter(od => od)
        commit('setBusiCategoriesOriginal', _busiData.data.categoriesLists)
        commit('setBusiCategoriesTree', GetTreeNode(copyObj))
      }
    },
  },
})
