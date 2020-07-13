import TagComp from './tag-comp.vue'

export default {
  ...TagComp,
  install: Vue => Vue.component('tag-common', TagComp),
}
