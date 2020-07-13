import GetUserinfo from './get-userinfo'

export default {
  ...GetUserinfo,
  install: Vue => Vue.component(GetUserinfo.name, GetUserinfo),
}
