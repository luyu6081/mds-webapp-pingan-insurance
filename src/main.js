/* istanbul ignore file */

import 'babel-polyfill'
import 'unfetch/polyfill/index'
import Vue from 'vue'
import svg4everybody from 'svg4everybody'
import {Message} from 'element-ui'
import './theme/index.css'

import '@/style/common.scss'
import '@/style/override-element-ui.scss'
import {getRuntimeArgs} from './runtime-args'

Vue.config.productionTip = false
Vue.prototype.$message = Message
svg4everybody()

// 手动提示 babel-polyfills 引入 es6.string.starts-with
''.startsWith('')

const esm = importCall => importCall.then(mod => mod.default || mod)

getRuntimeArgs().then(async () => {
  const router = await esm(import('./router'))
  const store = await esm(import('./store'))
  const {createProvider} = await esm(import('./vue-apollo'))
  const App = await esm(import('./app.vue'))

  new Vue({
    router,
    store,
    apolloProvider: createProvider(),
    ...App,
  }).$mount('#app')
})
