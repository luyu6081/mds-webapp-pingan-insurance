import Popcard from './popcard.vue'

export default {
  ...Popcard,
  install: Vue => Vue.component('common-popcard', Popcard),
}
