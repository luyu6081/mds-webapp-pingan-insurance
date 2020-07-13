<template>
  <div class="auth-platform-active-view">
    <el-dialog title="监测异常提示"
        :visible.sync="isCreateAPA"
        :close-on-click-modal="false"
        :show-close="false"
        width="600px"
        class="auth-platform-active-dialog">
        <!-- <div class="error-tip">监测出您当前的平台管理员信息发生变化<br />请联系服务提供商！</div> -->
        <div v-if="platFormType === 'expired'">
          <div class="error-tip">您当前租户所在的平台使用时间已过期<br />请联系平台管理员进行续费！</div>
        </div>
        <div v-if="platFormType === 'changed'">
          <div class="error-tip">监测出您当前租户所属的平台管理员信息发生变化<br />请联系平台管理员！</div>
        </div>
    </el-dialog>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Dialog,
  } from 'element-ui'

  Vue.use(Dialog)

  export default {
    name: 'EjAuthPlatformActive',
    components: {},
    props: {
      isCreateAPA: Boolean,
      platFormType: String,
    },
    methods: {
      closeCreateAPA () {
        this.$emit('closeCreateAPA', false)
      },
    },
  }
</script>
<style lang="scss">
  .auth-platform-active-view {
    .auth-platform-active-dialog {
      .el-dialog__header {
        text-align: center;
      }

      .el-dialog__body {
        padding: 50px;

        .active-tip {
          @apply text-blue;

          font-size: 18px;
          text-align: center;
        }

        .info-tip {
          .info-tip-title {
            @apply text-blue;

            font-size: 16px;
          }

          font-size: 14px;
          text-align: center;
        }

        .error-tip {
          font-size: 16px;
          text-align: center;
          color: #ff0000;
        }

        .level-tip {
          font-size: 14px;
          text-align: center;
        }
      }
    }
  }
</style>
