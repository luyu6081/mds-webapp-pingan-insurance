import AuthUser from './auth-user.vue'

export default {
  ...AuthUser,
  install: Vue => Vue.component('authUser', AuthUser),
}
