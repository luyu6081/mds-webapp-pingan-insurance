<script lang="jsx">
  import Vue from 'vue'
  import {TimePicker} from 'element-ui'

  Vue.use(TimePicker)

  export default {
    name: 'TimeCycle',

    functional: true,

    render: (h, {props, listeners}) => {
      return <el-time-picker {...{props: props, on: listeners, staticClass: 'app-date-time-editor'}} />
    },
  }
</script>

<style lang="scss">
  .app-date-time-editor.el-input {
    width: 120px !important;
  }
</style>
