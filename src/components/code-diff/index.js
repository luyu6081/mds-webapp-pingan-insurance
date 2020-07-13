import CodeDiff from './code-diff'
export default {
  ...CodeDiff,
  install: Vue => Vue.component(CodeDiff.name, CodeDiff),
}
