import Tooltip from './tooltip.vue'

export default {
  ...Tooltip,
  install: Vue => Vue.component(Tooltip.name, Tooltip),
}
