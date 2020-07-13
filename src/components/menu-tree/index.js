import MenuTree from './menutree.vue'

export default {
  ...MenuTree,
  install: Vue => Vue.component('menuTree', MenuTree),
}
