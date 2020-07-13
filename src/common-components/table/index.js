import Table from './table.vue'

export default {
  ...Table,
  install: Vue => Vue.component('common-table', Table),
}
