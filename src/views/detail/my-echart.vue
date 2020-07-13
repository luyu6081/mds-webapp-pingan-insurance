<template>
  <div class="blood-analysis">
    <div class="mb-5 filter border-b border-gray-light border-solid">
      <div class="mb-5 flex">
        <!-- <el-checkbox :true-label="1" :false-label="0" v-model="params.show_view">
          隐藏视图、宏、存储过程和UDF
        </el-checkbox> -->
        <!-- <el-checkbox :true-label="1"
                     :false-label="0"
                     class="flex-1 relation"
                     v-model="params.relation">只显示仓库内部关系</el-checkbox> -->
        <!-- <el-checkbox :true-label="1"
                     :false-label="0"
                     class="flex-1 relation"
                     v-model="params.fine_resolution">精细解析</el-checkbox> -->
        <div class="flex deep">
          <span class="label">分析深度</span>
          <el-slider v-model="depth" :format-tooltip="formatTooltip" :step="10" class="deep-action"/>
          <span>（共10层）</span>
        </div>
      </div>
      <!-- <div class="flex market mb-5">
        <span class="label">集市筛选：</span>
        <el-checkbox :true-label="2"
                     :false-label="1"
                     v-model="item.status"
                     v-for="(item, key) in params.configs"
                     :key="key"
                     class="market-text">{{item.name}}</el-checkbox>
      </div> -->
      <el-radio-group v-model="tabPosition" size="small" @change="handleEchartsPosition">
        <el-radio-button :label="1">图形分析</el-radio-button>
        <el-radio-button :label="2">列表分析</el-radio-button>
      </el-radio-group>
    </div>
    <div class="my-tabs mb-5">
      <div class="overflow-auto">
        <div v-show="tabPosition === 1">
          <div class="echart-title">
            <p class="tier_num tier">直接{{tag}}层级数：{{other.direct_tier}}</p>
            <p class="tier">{{tag}}表层级：{{other.tier}}层，{{tag}}表数：{{other.data_total}}</p>
          </div>
          <div ref="echart"
               :style="{height: height, width: width}"
               class="echart"></div>
        </div>
        <div v-show="tabPosition === 2">
          <el-table :data="tableList"
                    :header-cell-style="{background: '#fafafa'}"
                    border
                    :max-height="tableMaxHeight"
                    style="width: 100%">
            <el-table-column label="层级" prop="tier" width="50"/>
            <el-table-column label="平台名称" prop="platformName"/>
            <el-table-column label="数据库名称" prop="databaseName"/>
            <el-table-column label="对象名称" prop="name"/>
            <el-table-column label="对象类型" prop="type"/>
            <el-table-column label="注释" prop="desc" width="200"/>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {Checkbox, RadioButton, RadioGroup, Slider, Table, TableColumn} from 'element-ui'
  import echarts from 'echarts/lib/echarts'
  import 'echarts/lib/chart/graph'
  import 'echarts/lib/chart/tree'
  import 'echarts/lib/component/tooltip'

  import enumData from '@/js/enum'

  Vue.use(Checkbox)
  Vue.use(Slider)
  Vue.use(RadioGroup)
  Vue.use(RadioButton)
  Vue.use(Table)
  Vue.use(TableColumn)

  export default {
    _name: 'MyEchart', // 内部 ID，不要改
    name: 'MyEchart',
    props: {
      id: null,
      option: null,
      other: null,
      params: null,
      from: null,
      tableMaxHeight: {
        type: String,
        default: 'auto',
      },
      tableList: {
        type: Array,
      },
      height: {
        type: String,
        // default: '500px',
      },
      width: {
        type: String,
        // default: '500px',
      },
    },
    data () {
      return {
        tabPosition: 1,
        fromList: enumData.echartFromList,
        myChart: {},
      }
    },
    computed: {
      depth: {
        get () {
          return (this.params.depth * 10)
        },
        set (val) {
          this.params.depth = val / 10
        },
      },
      tag () {
        let fromList = enumData.echartFromList
        return this.from === fromList.effect.value ? '下游' : '上游'
      },
    },
    watch: {
      option () {
        this.$nextTick(() => {
          this.setTree()
        })
      },
      params: {
        deep: true,
        handler () {
          this.$emit('change', this.params)
        },
      },
    },
    mounted () {
      this.setTree()
    },
    methods: {
      handleEchartsPosition () {
        this.myChart.resize()
      },
      formatTooltip (val) {
        return val / 10
      },
      setTree () {
        let option = this.option
        if (!Object.keys(option)) return

        let myChart = echarts.init(this.$refs.echart)
        this.myChart = myChart
        this.myChart.resize()
        myChart.setOption(option)
      },
      resize () {
        this.$nextTick(() => {
          this.myChart.resize()
        })
      },
    },
  }
</script>

<style lang="scss">
  .blood-analysis {
    padding: 15px;

    .el-checkbox {
      margin-right: 0;
    }

    .deep {
      .el-slider__button {
        width: 11px;
        height: 11px;
      }

      .el-slider__runway {
        height: 4px;
      }

      .el-slider__runway {
        margin: 0;
      }
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 10px;
    }

    .filter {
      .relation {
        margin: 0 20px;
      }

      .market {
        .label {
          min-width: 70px;
        }

        .market-text {
          margin-right: 25px;
        }
      }
    }

    .deep {
      // margin-left: 20px;
      display: flex;
      align-items: center;

      .label {
        margin-right: 5px;
      }

      .deep-action {
        width: 100px;
        margin-left: 5px;
      }
    }

    .my-tabs {
      .el-radio-button__inner {
        @apply text-base;

        padding: 0 10px;
        height: 32px;
        line-height: 32px;
      }

      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        @apply bg-theme-color;
      }
    }

    .echart {
      min-width: 500px;
      min-height: 500px;
      margin: 0 auto !important;
    }

    .echart-title {
      margin: 10px 0;

      .tier {
        height: 20px;
        line-height: 20px;
        margin: 0;
        @apply text-gray-darkest;
      }

      .tier_num {
        margin-bottom: 5px;
      }
    }
  }
</style>
