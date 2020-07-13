import AuthPlatformActive from './auth-platform-active'

export default {
  ...AuthPlatformActive,
  install: Vue => Vue.component('auth-platform-active', AuthPlatformActive),
}
