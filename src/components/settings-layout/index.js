import SettingsLayout from './settings-layout.vue'

export default {
  ...SettingsLayout,
  install: Vue => Vue.component('settingsLayout', SettingsLayout),
}
