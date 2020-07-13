<script lang="jsx">
  import Vue from 'vue'
  import {Table} from 'element-ui'

  Vue.use(Table)

  export default {
    name: 'CommonTable',

    functional: true,

    render: (h, {props: $props, data: $data, children: $children}) => {
      const data = {
        ...$data,
        props: {
          headerCellClassName: 'app-table__header-cell',
          cellClassName: 'app-table__cell',
          ...$props,
        },
      }

      return <el-table {...data}>{$children}</el-table>
    },
  }
</script>

<style lang="scss">

  .app-table {

    /* override element-ui's style */

    &__header-cell {
      background: #fafafa !important;
      @apply text-gray-darkest;
    }

    &__cell {
      @apply text-gray-darkest;
    }
  }
</style>
