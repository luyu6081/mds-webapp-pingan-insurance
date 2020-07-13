import TagList from './tag-list.vue'

export default {
  ...TagList,
  install: Vue => Vue.component('common-tag-list', TagList),
}
