/* istanbul ignore file */

import CategoryMenu from './category-menu'

export default {
  ...CategoryMenu,
  install: Vue => {
    Vue.component('app-category-menu', CategoryMenu)
  },
}
