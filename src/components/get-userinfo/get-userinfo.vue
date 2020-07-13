<template>
  <div class="get-userinfo-view"></div>
</template>

<script>
  import GET_USERINFO from '@/graphql/get_userinfo.gql'

  export default {
    name: 'EjGetuserinfo',

    props: {
      client: {
        type: String,
      },
    },

    created () {
      this.init()
    },

    methods: {
      init () {
        this.getUserinfo()
      },
      getUserinfo () {
        this.client && (this.$apollo.client = this.client)
        this.$apollo.query({
          // client: 'ucClient',
          query: GET_USERINFO,
        }).then(respData => {
          let data = respData.data.data
          this.$store.commit('setUserInfo', data)
        })
      },
    },
  }
</script>
