import Vue from 'vue'
import {MenuItem} from 'element-ui'

import {NavSubmenu as EjNavSubmenu} from '@ej/ui'

import './style.scss'

Vue.use(MenuItem)

// function generateTree (nodeData, node) {
//   const clone = {...node}
//   clone.children = clone.children.length
//     ? clone.children.map(id => generateTree(nodeData, nodeData.find(n => n.id === id)))
//     : null
//   return clone
// }

function renderMenuItems (h, nodes) {
  return nodes.map(node => {
    return node.children && node.children.length
      ? (
        <EjNavSubmenu index={node.id}>
          <template slot="title">{node.name}</template>
          {renderMenuItems(h, node.children)}
        </EjNavSubmenu>
      )
      : <el-menu-item index={node.id}>{node.name}</el-menu-item>
  })
}

export default {
  name: 'AppCategoryMenu',

  functional: true,

  render: (h, {props, data, scopedSlots, parent}) => {
    const $store = parent.$store
    const {root} = props
    const inherited = {
      class: [].concat(data.staticClass, data.class),
    }

    const categories = $store.state.categories

    let rootCategory = categories.find(c => c.id === root)

    return rootCategory
      ? (
        <EjNavSubmenu index={rootCategory.id} {...inherited}>
          <template slot="title">{scopedSlots.title()}</template>
          {renderMenuItems(h, rootCategory.childern)}
        </EjNavSubmenu>
      )
      : null
  },
}
