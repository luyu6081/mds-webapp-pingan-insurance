<template>
  <div class="data-map-view">
    <div ref="mapData" :style="{width: currentImgSize.width + 'px', height: currentImgSize.height + 'px'}"
         class="data-map-wrap">
      <img ref="mapImg" src="https://dfjx-1258435240.cos.ap-chengdu.myqcloud.com/mds/data-map.gif"
           :style="[screenWidth > 1920 ? {width:screenWidth + 'px'} : '' ]"/>

      <!-- 左侧 -->
      <div v-for="(item, idx) in numsAxisArr"
           :key="item.x + idx"
           :style="{top: (item.y * currentImgSize.height) + 'px', left: (item.x * currentImgSize.width)  + 'px'}"
           class="data-nums absolute z-50">
        <p :style="{width: popoverNumsSize.width + 'px',
                      height: popoverNumsSize.height + 'px',
                      lineHeight: popoverNumsSize.height + 'px',
                      fontSize: currentFontSize + 'px'}"
           class="text-center">{{hotPointData && hotPointData.dataLeft[idx]}}</p>
      </div>
      <!-- 右侧 -->
      <div v-for="(item, idx) in hotAxisArr"
           :key="idx"
           :style="{top: (item.axis1.y * currentImgSize.height) + 'px', left: (item.axis1.x * currentImgSize.width)  + 'px'}"
           class="data-source-popover absolute z-50">
        <el-popover placement="top" min-width="100" trigger="hover" popper-class="data-map-popover">
          <i class="big-border top"><img src="@/assets/data-map/big-border.svg"/></i>
          <i class="big-border bottom"><img src="@/assets/data-map/big-border.svg"/></i>
          <i class="small-border top"><img src="@/assets/data-map/small-border.svg"/></i>
          <i class="small-border bottom"><img src="@/assets/data-map/small-border.svg"/></i>
          <div class="hot-data">
            <h3 class="mb-2"><i class="title mr-4"><img src="@/assets/data-map/title.svg"/></i>{{hotPointData &&
              hotPointData.dataRight[idx].title}}</h3>
            <div><span>数据表数量：</span><span>{{hotPointData && hotPointData.dataRight[idx].nums}}个</span></div>
            <div><span>数据记录数：</span><span>{{hotPointData && hotPointData.dataRight[idx].reports}}条</span></div>
          </div>
          <el-button slot="reference"
                     :style="{width: popoverBtnSize.width + 'px', height: popoverBtnSize.height + 'px'}"
                     class="opacity-0"></el-button>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script>
  import {Popover as ElPopover, Button as ElButton} from 'element-ui'

  import QUERY_LOAD_DATA_MAP from '@/graphql/data-map-list.gql'

  /**
   * 数据来源：坐标点集合
   * 参照尺寸[1920, 1000]
   * 顺序是：右上 -> 左上 -> 右下
   */
  const HotAxis = () => {
    return [
      {x: 1757.0, y: 567},
      // {x: 1687.1, y: 529.3},
      // {x: 1616.7, y: 488.8},
      // {x: 1546.3, y: 449.6},
      // {x: 1476.4, y: 406.7},
      // {x: 1404.7, y: 368.9},
      // {x: 1338.8, y: 329.7},
      //
      // {x: 1268.9, y: 286.3},
      // {x: 1198.0, y: 246.3},
      // {x: 1127.6, y: 206.8},
      // {x: 1057.7, y: 164.9},
      // {x: 992.8, y: 136.4},
      // {x: 916.4, y: 86.5},
      // {x: 847.5, y: 45.5},
      // {x: 775.0, y: 122.0},
      // {x: 849.5, y: 162.7},
      // {x: 921.9, y: 205.4},
      // {x: 994.4, y: 246.1},
      // {x: 1069.8, y: 286.8},
      // {x: 1142.8, y: 329.5},
      // {x: 1216.2, y: 374.2},
      // {x: 1289.7, y: 413.0},
      // {x: 1360.2, y: 455.7},
      // {x: 1434.6, y: 498.4},
      // {x: 1510.1, y: 540.1},
      // {x: 1575.5, y: 579.8},
      // {x: 1644.0, y: 623.0}
    ]
  }

  /**
   * 左侧数量及记录总数：坐标点集合
   * 参照尺寸[1920, 1000]
   * 顺序是：上->下
   */
  const NumsAxis = () => {
    return [{x: 186.0, y: 160.6},
            {x: 186.0, y: 268.0},
            {x: 186.0, y: 378},
            {x: 186.0, y: 484}]
  }

  export default {
    name: 'DataMapView',

    components: {
      ElPopover,
      ElButton,
    },

    data () {
      /**
       * 图片原始尺寸
       * 参照尺寸[1920, 1000]
       */
      const refSize = {
        width: 1920,
        height: 1000,
      }

      /**
       * 左侧字体原始尺寸
       * 参照尺寸[1920, 1000]
       */
      const originalFontSize = 30

      const originalFontSizePercent = originalFontSize / refSize.width // 左侧字体与宽度的比例

      const hotShape = { // 桶的宽高
        width: 33,
        height: 80,
      }

      const hotShapePercent = { // 桶的宽高比例
        width: hotShape.width / refSize.width,
        height: hotShape.height / refSize.height,
      }

      const numsShape = { // 左侧数量的宽高
        width: 160,
        height: 54,
      }

      const numsShapePercent = { // 左侧数量的宽高比例
        width: numsShape.width / refSize.width,
        height: numsShape.height / refSize.height,
      }

      return {
        screenWidth: document.body.clientWidth >= 1100 ? document.body.clientWidth : 1100,

        originalImgSize: refSize, // 图片原始尺寸

        hotAxisArr: [], // 热点坐标比例

        hotShape: hotShape, // 桶的宽高

        hotShapePercent: hotShapePercent, // 桶的宽高比例

        currentMouseMove: -1, // 鼠标当前所移动到的热点

        // hotPointData: [], // 热点桶框数据集合

        numsAxisArr: [], // 左侧数量及记录数坐标比例

        numsShape: numsShape, // 桶的宽高

        numsShapePercent: numsShapePercent, // 桶的宽高比例

        originalFontSize: originalFontSize, // 左侧字体的原始尺寸

        originalFontSizePercent: originalFontSizePercent, // 左侧字体与宽度的比例
      }
    },

    computed: {
      /**
       * 当前图片尺寸
       */
      currentImgSize () {
        let currentScale = this.screenWidth / this.originalImgSize.width
        let currentHeight = currentScale * this.originalImgSize.height

        return {
          width: this.screenWidth,
          height: currentHeight,
        }
      },

      /**
       * 左侧字体的当前尺寸
       */
      currentFontSize () {
        return this.originalFontSizePercent * this.currentImgSize.width
      },

      popoverBtnSize () {
        return {
          width: this.hotShapePercent.width * this.currentImgSize.width,
          height: this.hotShapePercent.height * this.currentImgSize.height,
        }
      },

      popoverNumsSize () {
        return {
          width: this.numsShapePercent.width * this.currentImgSize.width,
          height: this.numsShapePercent.height * this.currentImgSize.height,
        }
      },
    },

    watch: {
      screenWidth (val) {
        if (val >= 1100) {
          this.screenWidth = val
        }
      },
    },

    apollo: {
      hotPointData: {
        query: QUERY_LOAD_DATA_MAP,
        update (data) {
          return data.loadDataMap
        },
      },
    },

    created () {
      this.initPercent()
    },

    mounted () {
      window.onresize = () => {
        return (() => {
          window.screenWidth = document.body.clientWidth
          this.screenWidth = window.screenWidth >= 1100 ? window.screenWidth : 1100
        })()
      }
    },

    methods: {
      /**
       * 初始化坐标, 根据比例将坐标换成百分比
       */
      initPercent () {
        // 右侧
        let axisPercent = HotAxis()
        for (const a of axisPercent) {
          let x1 = a.x / this.originalImgSize.width
          let y1 = a.y / this.originalImgSize.height

          let x2 = (a.x + this.hotShape.width - 30) / this.originalImgSize.width
          let y2 = (a.y - this.hotShape.height + 50) / this.originalImgSize.height

          this.hotAxisArr.push({
            axis1: {
              x: x1,
              y: y1,
            },
            axis2: {
              x: x2,
              y: y2,
            },
          })
        }

        // 左侧
        let numsPercent = NumsAxis()
        for (const a of numsPercent) {
          let x = (a.x - 70) / this.originalImgSize.width
          let y = (a.y - 25) / this.originalImgSize.height

          this.numsAxisArr.push({
            x: x,
            y: y,
          })
        }
      },
    },
  }
</script>

<style lang="scss">
  .data-map-view {
    @apply flex-1 flex items-center justify-center text-2xl text-white relative inset-0;

    min-width: 1100px;

    .data-map-wrap {
      @apply overflow-hidden relative;
    }

    .data-source-popover {
      .data-desc {
        @apply bg-blue hidden;
        width: 201px;
        height: 150px;
      }

      &:hover {
        .data-desc {
          @apply inline-block;
        }
      }
    }
  }

  .data-map-popover[x-placement^=top] .popper__arrow {
    bottom: -6px;
    margin-left: -6px;
    border-top-color: rgba(40, 70, 136, 8) !important;
    border-bottom-width: 0;

    &::after {
      border-top-color: rgba(40, 70, 136, 8) !important;
    }
  }

  .data-map-popover[x-placement^=bottom] .popper__arrow {
    bottom: 1px;
    margin-left: -6px;
    border-top-width: 0;
    border-bottom-color: rgba(40, 70, 136, 8) !important;

    &::after {
      border-bottom-color: rgba(40, 70, 136, 8) !important;
    }
  }

  .data-map-popover {
    @apply text-white ;

    border-radius: 0;
    border: none;
    background: rgba(40, 70, 136, 8);
    margin-bottom: 0;
    opacity: .85;

    .title {
      @apply inline-block text-lg;

      width: 15px;
      height: 11px;
    }

    h3 {
      @apply font-semibold tracking-widest;

      color: rgb(0, 255, 255);
    }

    .small-border {
      @apply inline-block absolute z-50;

      width: 8px;
      height: 8px;
    }

    .small-border.top {
      top: 5px;
      left: -2px;
      transform: rotate(180deg);
    }

    .small-border.bottom {
      bottom: 5px;
      right: -1px;
    }

    .big-border {
      @apply inline-block absolute z-50;

      width: 20px;
      height: 20px;
    }

    .big-border.top {
      top: -2px;
      right: -1px;
    }

    .big-border.bottom {
      bottom: -2px;
      left: -1px;
      transform: rotate(180deg);
    }
  }
</style>
