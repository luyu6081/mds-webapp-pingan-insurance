<template>
  <div v-show="crumbs.length" class="search-breadcrumb">
    <el-breadcrumb separator="/">
      <!-- :to="{ name: crumb.routeName }" -->
      <el-breadcrumb-item v-for="(crumb, idx) in crumbs" :key="idx">{{crumb}}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
  } from 'element-ui'

  export default {
    name: 'SearchBreadcrumb',

    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
    },

    computed: {
      crumbs () {
        const categories = this.$store.state.categories
        const crumbs = []

        let currId = this.$route.query.category
        let curr

        while ((curr = categories.find(c => c.id === currId))) {
          crumbs.unshift(curr.name)
          currId = curr.parent
        }

        return crumbs
      },
    },
  }
</script>

<style lang="scss" scoped>

  .search-breadcrumb {
    margin-bottom: 13px;
    line-height: 20px;
    padding: 0 24px;
    @apply text-base text-gray-darker;

    .el-breadcrumb {
      @apply text-gray-darker;
      display: inline-block;
      padding-bottom: 3px;
      //border-bottom: 2px solid $color_CFCFCF;
    }
  }
</style>
