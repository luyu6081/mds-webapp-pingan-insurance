<template>
  <div class="search-filter">
    <el-row v-if="filter" class="block-col-2" :gutter="5">
      <el-col :span="3">
        <el-dropdown class="filter-dropdown" @command="handleTenant">
          <span class="el-dropdown-link">
            {{dropdownTitle.tenantTitle}}<i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown" class="filter-dropdown-menu  filter-tenant">
            <el-dropdown-item v-for="tenant in filter.tenant"
                              :key="tenant.id"
                              :command="tenant.id"
                              :class="{searchFilterActiveClass: filterWords.tenant === tenant.id}"
                              class="clearfix">
              {{tenant.name}}<em class='search-filter-data-nums fr'>{{tenant.num}}</em>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :span="3">
        <el-dropdown class="filter-dropdown" @command="handleApplication">
          <span class="el-dropdown-link">
            {{dropdownTitle.applicationTitle}}<i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown" class="filter-dropdown-menu">
            <el-dropdown-item v-for="application in filter.belongApp"
                              :key="application.id"
                              :command="application.id"
                              :class="{searchFilterActiveClass: filterWords.application === application.id}"
                              class="clearfix">
              {{application.name}}<em class='search-filter-data-nums fr'>{{application.num}}</em>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :span="3">
        <el-dropdown class="filter-dropdown" @command="handleSystem">
          <span class="el-dropdown-link">
            {{dropdownTitle.systemTitle}}<i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown" class="filter-dropdown-menu">
            <el-dropdown-item v-for="system in filter.belongSystem"
                              :key="system.id"
                              :command="system.id"
                              :class="{searchFilterActiveClass: filterWords.system === system.id}"
                              class="clearfix">
              {{system.name}}<em class='search-filter-data-nums fr'>{{system.num}}</em>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :span="3">
        <el-dropdown class="filter-dropdown" @command="handleResource">
          <span class="el-dropdown-link">
            {{dropdownTitle.resourceTitle}}<i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown" class="filter-dropdown-menu">
            <el-dropdown-item v-for="resource in filter.belongResource"
                              :key="resource.id"
                              :command="resource.id"
                              :class="{searchFilterActiveClass: filterWords.resource === resource.id}"
                              class="clearfix">
              {{resource.name}}<em class='search-filter-data-nums fr'>{{resource.num}}</em>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :span="3">
        <el-dropdown class="filter-dropdown" @command="handleDatatype">
          <span class="el-dropdown-link">
            {{dropdownTitle.datatypeTitle}}<i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown" class="filter-dropdown-menu filter-datatype">
            <el-dropdown-item v-for="datatype in filter.dataType"
                              :key="datatype.id"
                              :command="datatype.id"
                              :class="{searchFilterActiveClass: filterWords.datatype === datatype.id}"
                              class="clearfix">
              {{datatype.name}}<em class='search-filter-data-nums fr'>{{datatype.num}}</em>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {
    Dropdown as ElDropdown,
    DropdownMenu as ElDropdownMenu,
    DropdownItem as ElDropdownItem,
    Row as ElRow,
    Col as ElCol,
  } from 'element-ui'

  import QUERY_SEARCH_FILTER from '@/graphql/search_filter_choose.gql'

  const tenantData = [{
    id: 1,
    name: '租户一',
    nums: 50,
  }, {
    id: 2,
    name: '租户二',
    nums: 22,
  }, {
    id: 3,
    name: '租户三',
    nums: 1,
  }]

  const applicationData = [{
    id: 1,
    name: '应用一',
    nums: 50,
  }, {
    id: 2,
    name: '应用二',
    nums: 22,
  }, {
    id: 3,
    name: '应用三',
    nums: 1,
  }]

  const systemData = [{
    id: 1,
    name: '系统一',
    nums: 50,
  }, {
    id: 2,
    name: '系统二',
    nums: 22,
  }, {
    id: 3,
    name: '系统三',
    nums: 1,
  }]

  const resourceData = [{
    id: 1,
    name: '资源一',
    nums: 50,
  }, {
    id: 2,
    name: '资源二',
    nums: 22,
  }, {
    id: 3,
    name: '资源三',
    nums: 1,
  }]

  const typeData = [{
    id: 1,
    name: '数据类型一',
    nums: 50,
  }, {
    id: 2,
    name: '数据类型二',
    nums: 22,
  }, {
    id: 3,
    name: '数据类型三',
    nums: 1,
  }]

  export default {
    name: 'SearchFilter',

    components: {
      ElRow,
      ElCol,
      ElDropdown,
      ElDropdownMenu,
      ElDropdownItem,
    },

    data () {
      return {
        dropdownTitle: {
          tenantTitle: '租户名称',
          applicationTitle: '所属应用',
          systemTitle: '所属系统',
          resourceTitle: '所在资源',
          datatypeTitle: '数据类型',
        },
        filterWords: {
          tenant: '',
          application: '',
          system: '',
          resource: '',
          datatype: '',
        },
        tenants: [],
        applications: [],
        systems: [],
        resources: [],
        dataTypeList: [],
      }
    },

    apollo: {
      filter: {
        query: QUERY_SEARCH_FILTER,
        update: data => data.filter,
      },
    },

    created () {
      this.tenants = tenantData
      this.applications = applicationData
      this.systems = systemData
      this.resources = resourceData
      this.dataTypeList = typeData
    },

    methods: {
      handleTenant (command) {
        this.filterWords.tenant = command
        this.handleFilter()
      },
      handleApplication (command) {
        this.filterWords.application = command
        this.handleFilter()
      },
      handleSystem (command) {
        this.filterWords.system = command
        this.handleFilter()
      },
      handleResource (command) {
        this.filterWords.resource = command
        this.handleFilter()
      },
      handleDatatype (command) {
        this.filterWords.datatype = command
        this.handleFilter()
      },
      handleFilter () {
        this.$emit('search-filter', this.filterWords)
      },
    },
  }
</script>

<style>
  .searchFilterActiveClass {
    @apply bg-blue-lighter text-blue;
  }

  .search-filter-data-nums {
    margin-left: 20px;
    font-size: 12px;
    transform: scale(.9);
    @apply text-sm;
  }
  .filter-dropdown .el-icon--right {
    margin-left: 15px;
  }
</style>

<style lang="scss" scoped>

  .filter {
    &-dropdown-menu {
      margin-top: 0;
      overflow: hidden;
    }
    &-tenant {
      margin-left: 15px;
    }
  }
</style>
