<script lang="jsx">
  import Vue from 'vue'
  import {Select as ElSelect, Option as ElOption} from 'element-ui'

  Vue.use(ElSelect)
  Vue.use(ElOption)

  export default {
    name: 'WeekCycle',

    functional: true,

    render: (h, {props, listeners}) => {
      const Week = [{
        id: 'MONDAY',
        name: '周一',
      }, {
        id: 'TUESDAY',
        name: '周二',
      }, {
        id: 'WEDNESDAY',
        name: '周三',
      }, {
        id: 'THURSDAY',
        name: '周四',
      }, {
        id: 'FRIDAY',
        name: '周五',
      }, {
        id: 'SATURDAY',
        name: '周六',
      }, {
        id: 'SUNDAY',
        name: '周日',
      }]
      return (
        <el-select {...{props: props, on: listeners, staticClass: 'app-date-week-editor'}}>
          {
            Week.map(item => {
              return <el-option label={item.name} value={item.id}></el-option>
            })
          }
        </el-select>
      )
    },
  }
</script>

<style lang="scss">
  .app-date-week-editor {
    width: 120px !important;
    margin-right: 10px;
  }
</style>
