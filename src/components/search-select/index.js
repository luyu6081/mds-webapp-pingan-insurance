import SearchSelect from './search-select.vue'

export default {
  ...SearchSelect,
  install: Vue => Vue.component('searchSelect', SearchSelect),
}
