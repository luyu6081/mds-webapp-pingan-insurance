<script lang="jsx">
  import Vue from 'vue'
  import {Select as ElSelect, Option as ElOption} from 'element-ui'

  Vue.use(ElSelect)
  Vue.use(ElOption)

  export default {
    name: 'DayCycle',

    functional: true,

    render: (h, {props, listeners}) => {
      let Days = []
      for (let i = 1; i <= 31; i++) {
        Days.push({
          id: i,
          name: i + '日',
        })
      }

      return (
        <el-select {...{props: props, on: listeners, staticClass: 'app-date-day-editor'}}>
          {
            Days.map(item => {
              return <el-option label={item.name} value={item.id}></el-option>
            })
          }
        </el-select>
      )
    },
  }
</script>

<style lang="scss">
  .app-date-day-editor {
    width: 120px !important;
    margin-right: 10px;
  }
</style>
