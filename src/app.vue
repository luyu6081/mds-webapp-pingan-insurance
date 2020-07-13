<template>
  <div id="app" :class="['flex flex-col', {'is-body-only': bodyOnly}]" :style="{backgroundColor: $route.name === 'home' ? '#fff' : undefined}">
    <ej-getuserinfo client="ucClient"/>

    <template v-if="!$route.meta.layout">
      <app-header v-if="!bodyOnly"
                  :logo="require('@/assets/logo.svg')"
                  title="元数据"
                  :user="userData"
                  @dblclick.native="goPlayground"
                  @search="handleSearch">
        <!-- MENU -->
        <ej-nav-menu :default-active="activeIndex"
                     mode="horizontal"
                     text-color="#fff"
                     active-text-color="#fff"
                     class="app-nav__menu flex"
                     @select="onMenuSelect">
          <el-menu-item index="_0"
                        class="app-nav__menu-item flex items-center"
                        @click="$router.push({name: 'home'})">
            <span>首页</span>
          </el-menu-item>

          <app-category-menu key="tech" root="tech" class="app-nav__menu-item flex items-center">
            <template #title>
              <span>技术类目</span>
            </template>
          </app-category-menu>

          <app-category-menu key="busi" root="busi" class="app-nav__menu-item flex items-center">
            <template #title>
              <span>业务类目</span>
            </template>
          </app-category-menu>

          <ej-nav-submenu index="_3"
                          :show-timeout="100"
                          class="app-nav__menu-item flex items-center">
            <template #title>更多</template>
            <el-menu-item index="_3-1" @click="$router.push('/data-map')">
              <span>数据地图</span>
            </el-menu-item>
            <el-menu-item index="_3-2">
              <span><a :href="jumpKCAddress" target="_blank">政策法规</a></span>
            </el-menu-item>
            <!-- <el-menu-item index="_3-3" @click="$router.push({name: 'question-index'})">
              <span>知识广场</span>
            </el-menu-item> -->
          </ej-nav-submenu>
        </ej-nav-menu>

        <template #tray>
          <app-search/>
          <app-setting v-if="mdsSetting" @click.native="$router.push('/app-settings')"/>
          <app-notification/>
          <app-usermenu :user="userData" :endpoint="fileDownloadAddress"/>
        </template>
      </app-header>

      <div v-ej-loading.fullScreen="!loading" :class="['app-main flex-1', $route.name === 'data-map' ? 'app-main-bg' : 'app-main-m-p']">
        <router-view v-if="loading && !isCreateAPA" class="app-view"/>
        <auth-platform-active :isCreateAPA="isCreateAPA" @closeCreateAPA="closeCreateAPA" :platFormType="platFormType" v-if="isCreateAPA"></auth-platform-active>
      </div>
      <!-- <div class="app-main flex-1">
        <router-view class="app-view"/>
      </div> -->

    </template>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {mapGetters, mapState} from 'vuex'
  import {Badge, Menu, MenuItem, Submenu, Message} from 'element-ui'

  import {
    AppHeader,
    AppNotification,
    AppSearch,
    AppSetting,
    AppUsermenu,
    Icon,
    NavMenu as EjNavMenu,
    NavSubmenu as EjNavSubmenu,
    Loading,
  } from '@ej/ui'

  import runtimeArgs from '@/runtime-args'
  import CategoryMenu from '@/components/category-menu'
  import GetUserinfo from '@/components/get-userinfo'
  import AuthPlatformActive from '@/components/auth-platform-active'

  import CHECK_PLATFORM_CODE_STATUS from '@/graphql/check_platform_code_status.gql'
  import CHECK_TENANT_CODE_STATUS from '@/graphql/check_tenant_code_status.gql'

  Vue.use(Icon)

  Vue.use(Badge)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Submenu)
  Vue.use(Loading)

  Vue.use(CategoryMenu)
  Vue.use(GetUserinfo)
  Vue.use(AuthPlatformActive)

  /** 政策法规-跳转KC系统地址 */
  const JUMP_KC_ADDRESS = runtimeArgs.VUE_APP_KC_GRAPHQL_HTTP

  /** 下载地址 */
  const FILE_DOWNLOAD_ADDRESS = runtimeArgs.VUE_APP_DOWNLOAD_HTTP

  /** 登录地址 */
  const LOGIN_URL_ADDRESS = runtimeArgs.VUE_APP_LOGIN_URL

  /** UC 地址 */
  const UC_URL_ADDRESS = runtimeArgs.VUE_APP_UC_HTTP

  export default {
    name: 'App',

    components: {
      AppHeader,
      AppSearch,
      AppNotification,
      AppSetting,
      AppUsermenu,
      EjNavMenu,
      EjNavSubmenu,
    },

    data () {
      return {
        activeIndex: '1',
        isCreateAPA: false, // 平台激活码
        platFormType: '', // 过期'expired' 信息变化'changed'
      }
    },

    computed: {
      ...mapState({
        bodyOnly: 'bodyOnly',
      }),
      ...mapGetters([
        'userData',
      ]),
      loading () {
        return Object.keys(this.userData).length
      },
      mdsSetting () {
        if (this.loading) {
          // 判断该平台账户是否已激活过激活码
          if (this.userData.permissionCodes.includes('platformManager') && !this.isCreateAPA) {
            this.checkPlatformCodeStatus()
          }
          // 判断该租户是否已激活过激活码
          if (this.userData.permissionCodes.includes('ucManager') && !this.isCreateAPA) {
            this.checkTenantCodeStatus()
          }

          return this.userData.permissionCodes.includes('mdsSetting')
        }
        return false
      },
      jumpKCAddress () {
        return JUMP_KC_ADDRESS
      },
      fileDownloadAddress () {
        return {
          avatarUrl: FILE_DOWNLOAD_ADDRESS,
          loginUrl: LOGIN_URL_ADDRESS,
          ucUrl: UC_URL_ADDRESS,
          client: 'ucClient',
        }
      },
    },

    watch: {
      timer (val, oldVal) {
        if (oldVal) {
          window.clearTimeout(oldVal)
        }
      },
    },

    async mounted () {
      await this.$store.dispatch('categoriesTechList')
      await this.$store.dispatch('categoriesBusiList')
    },

    updated () {
      if (this.$route.name === 'app-settings') {
        this.activeIndex = undefined
      } else {
        this.activeIndex = '1'
      }
    },

    methods: {
      checkTenantCodeStatus () {
        this.$apollo.query({
          query: CHECK_TENANT_CODE_STATUS,
          fetchPolicy: 'no-cache',
          client: 'ucClient',
        }).then(respData => {
          let dataResult = respData.data.data
          if (this.loading) {
            this.isCreateAPA = this.userData.permissionCodes.includes('ucManager') && !dataResult
          }
        }).catch(err => {
          let code = err.graphQLErrors[0].extensions.code
          if (code === '1700') {
            this.isCreateAPA = true
            this.platFormType = 'expired'
          } else if (code === '1701') {
            this.isCreateAPA = true
            this.platFormType = 'changed'
          } else {
            Message.error({message: err.message || '请求失败请重试'})
          }
        })
      },

      /* 平台激活码 */
      checkPlatformCodeStatus () {
        this.$apollo.query({
          query: CHECK_PLATFORM_CODE_STATUS,
          fetchPolicy: 'no-cache',
          client: 'ucClient',
        }).then(respData => {
          let dataResult = respData.data.data
          if (this.loading) {
            this.isCreateAPA = this.userData.permissionCodes.includes('platformManager') && !dataResult
          }
        }).catch(err => {
          let code = err.graphQLErrors[0].extensions.code
          if (code === '1700') {
            this.isCreateAPA = true
            this.platFormType = 'expired'
          } else if (code === '1701') {
            this.isCreateAPA = true
            this.platFormType = 'changed'
          } else {
            Message.error({message: err.message || '请求失败请重试'})
          }
        })
      },
      closeCreateAPA (val) {
        this.isCreateAPA = val
      },

      handleSearch (...arg) {
        if (arg && arg[0]) {
          this.$router.push({name: 'search', query: {s: arg[0]}})
        }
      },

      onMenuSelect (index, indexPath) {
        if (index && index[0] !== '_') {
          let _indexPath = [...indexPath]
          _indexPath.shift()

          this.$router.push({name: 'search', query: {categoryType: indexPath[0], categoryId: _indexPath}})
        }
      },

      goPlayground () {
        if (process.env.NODE_ENV === 'development') {
          this.$router.push({name: 'playground'})
        }
      },
    },
  }
</script>

<style lang="scss">
  #app {
    @apply bg-gray-lighter;

    min-height: 100vh;

    .ej-app-header {
      min-width: 1100px;
    }
  }

  .is-body-only {
    .app-main {
      margin: 0;
      padding: 0;
    }
  }

  .app-nav {
    /* override element-ui's style */

    .el-badge {
      span {
        display: block;
      }

      sup {
        right: 4px;
      }
    }
  }

  .app {
    &-main {
      height: 100%;
    }
    &-main-m-p {
      margin: 0 30px;
      padding: 20px 0;
    }
    &-main-bg {
      background: url('./assets/data-map/bg.jpg') no-repeat center;
      background-size: 100% 100%;
      // background: linear-gradient(to right, #272974 100%, #252471 50%, #241f6f 0%);
    }
    &-main-margin-top {
      margin-top: 20px;
    }
  }

  .app-view {
    min-height: 100%;
    box-sizing: border-box;
  }
</style>
<style lang="scss">
  .el-menu--popup-bottom-start .el-menu--popup-right-start .el-menu--popup-right-start{
    height: 300px;
    overflow-y: auto;

    /*滚动条样式*/
    &::-webkit-scrollbar {
      width: 6px; /*高宽分别对应横竖滚动条的尺寸*/
      height: 1px;
    }

    &::-webkit-scrollbar-thumb { /*滚动条里面小方块*/
      @apply bg-gray;
    }

    &::-webkit-scrollbar-track { /*滚动条里面轨道*/
      @apply bg-gray-lightest;
      -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    }
  }
</style>
