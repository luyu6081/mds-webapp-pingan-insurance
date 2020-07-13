<template>
  <el-steps :active="currentValue" class="my-steps">
    <el-step v-for="(item, index) in stepList"
             :key="index"
             :class="[{active: activeStep === item.step}, {success: activeStep > item.step}]">
      <template #icon>
        <span v-if="activeStep > item.step" class="success-num"><i class="el-icon-check"></i></span>
        <span v-else class="num">{{index + 1}}</span>
        <span class="title">{{item.title}}</span>
      </template>
    </el-step>
  </el-steps>
</template>

<script>
  import {Step as ElStep, Steps as ElSteps} from 'element-ui'

  export default {
    name: 'EjStepBar',

    components: {
      ElStep,
      ElSteps,
    },

    props: {
      activeStep: Number,
      stepList: Array,
    },

    data () {
      return {
        currentValue: this.activeStep,
      }
    },

    watch: {
      activeStep (val) {
        this.currentValue = val
      },
    },
  }
</script>
<style lang="scss">
  .my-steps {
    .el-step__head .el-step__line {
      height: 1px !important;
    }
    .el-step__head.is-finish .el-step__line {
      height: 1px !important;
      .el-step__line-inner {
        @apply bg-blue;

        border-width: 0 !important;
      }
    }
    .success {
      .title {
        @apply text-blue;
      }
      .success-num {
        @apply mr-2;
      }
    }
    .active {
      .num {
        @apply text-white bg-blue border-blue;
      }
      .title {
        @apply text-blue;
      }
    }
    .num {
      @apply text-gray-dark bg-white border border-gray-dark rounded-full inline-block mr-2;

      width: 20px;
      height: 20px;
      text-align: center;
      line-height: 18px;
    }
    .title {
      @apply text-gray-dark;
    }
    .el-step__icon.is-text {
      border: none;
      i {
        @apply border border-solid border-blue text-blue;
        border-radius: 50%;
        padding: 2px;
      }
    }
    .el-step__icon {
      width: 120px;
    }
  }
</style>
