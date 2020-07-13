<template>
  <el-select v-model="curValue"
              multiple
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteMethod"
              :loading="loading"
              @change="handleChange">
    <el-option v-for="item in users"
              :key="item.userId"
              :label="item.label"
              :value="item.userId">
    </el-option>
  </el-select>
</template>

<script>
  import QUERY_AUTH_NAME_CARD from '@/graphql/auth-name-card-query.gql'

  export default {
    props: {
      value: Array,
    },
    model: {
      prop: 'value',
      event: 'update',
    },
    data () {
      return {
        keyWords: '',
        loading: false,
        users: [],
        curValue: this.value,
      }
    },
    apollo: {
      $client: 'ucClient',
      users: {
        query: QUERY_AUTH_NAME_CARD,
        variables () {
          return {
            input: {
              keyWords: this.keyWords,
            },
          }
        },
        result ({data: {users}}) {
          users.map(x => {
            x.label = `${x.name}(${x.jobNumber})`
          })
          this.users = users
          this.loading = false
        },
        // debounce: 2000,
      },
    },
    methods: {
      handleChange (value) {
        this.$emit('update', value)
      },
      remoteMethod (query) {
        if (query.length > 0) {
          this.loading = true
          this.keyWords = query
        }
      },
    },
    watch: {
      'value': {
        immediate: true,
        handler (newVal) {
          this.curValue = newVal
        },
      },
    },
  }
</script>
