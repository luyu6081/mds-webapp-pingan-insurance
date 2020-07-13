<template>
  <code-diff v-bind="$attrs"
             id="code-diff"
             class="ej-code-diff"/>
</template>

<script>
  import CodeDiff from 'vue-code-diff'

  export default {
    name: 'EjCodeDiff',

    components: {
      CodeDiff,
    },
  }
</script>

<style lang="scss">
.ej-code-diff {
  /*解决行溢出*/
  .d2h-code-side-linenumber, .d2h-code-linenumber {
    @apply static;
  }

  .d2h-code-side-line, .d2h-code-line {
    @apply ml-0;
  }
  /*解决行溢出*/
}
</style>
