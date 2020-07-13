<template>
  <div :class="['app-settings-view', {'datasources-only': datasourcesOnly}]" :style="{minHeight: screenHeight + 'px'}">
    <nav>
      <ul>
        <router-link tag="li" to="/app-settings/datasources" class="nav-item">数据源</router-link>
        <template v-if="!datasourcesOnly">
          <router-link tag="li" to="/app-settings/tech-catalog" class="nav-item">技术类目</router-link>
          <router-link tag="li" to="/app-settings/busi-catalog" class="nav-item">业务类目</router-link>
          <router-link tag="li" to="/app-settings/tags" class="nav-item">标签管理</router-link>
          <router-link tag="li" to="/app-settings/logs" class="nav-item">日志管理</router-link>
        </template>
      </ul>
    </nav>

    <router-view class="flex-1"/>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex'
  import store from '@/store/index'

  export default {
    name: 'AppSettingsView',

    data () {
      return {
        outOfRangeHeight: 100,
        screenHeight: document.body.clientHeight - 100,
      }
    },

    computed: {
      ...mapState({
        datasourcesOnly: 'datasourcesOnly',
      }),
      ...mapGetters([
        'userData',
      ]),
    },

    beforeCreate () {
      const _user = store.state.userData
      if (!_user.permissionCodes || !_user.permissionCodes.includes(this.$route.meta.authName)) {
        this.$router.push({name: 'home'})
      }
    },

    mounted () {
      this.$nextTick(() => {
        window.onresize = () => {
          return (() => {
            this.screenHeight = document.body.clientHeight - this.outOfRangeHeight
          })()
        }
      })
    },

    // beforeRouteEnter (to, from, next) {
    //   const _user = store.state.userData
    //   if (_user.permissionCodes && _user.permissionCodes.includes(to.meta.authName)) {
    //     next()
    //   } else {
    //     next('/')
    //   }
    // },
  }
</script>

<style lang="scss">
  @import '../../style/variables';

  .app-settings-view {
    @apply mx-auto flex;

    width: $page-width-default;

    &.datasources-only {
      width: 100%;
    }

    > nav {
      @apply flex-none bg-white;

      width: 238px;
      padding: 20px 0;
      margin-right: 2px;

      .nav-item {
        @apply text-lg cursor-pointer;

        padding: 0 55px;
        line-height: 40px;

        &.active {
          @apply text-blue bg-blue-lighter rounded shadow;
        }
      }
    }
    .el-dialog__wrapper {
      .el-button--primary {
        @apply bg-blue border-blue;
      }
    }
    .ej-search-input {
      height: 38px !important;
    }
  }
</style>
