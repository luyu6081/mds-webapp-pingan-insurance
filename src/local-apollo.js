import {createApolloClient} from 'vue-cli-plugin-apollo/graphql-client'

import runtimeArgs from '@/runtime-args'

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

// Http endpoint
const httpEndpoint = 'http://localhost:4000/graphql'
// Files URL root
export const filesRoot = runtimeArgs.VUE_APP_FILES_ROOT || httpEndpoint.substr(0, httpEndpoint.indexOf('/graphql'))

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint,
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: runtimeArgs.VUE_APP_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  // link: myLink

  // Override default cache
  // cache: myCache

  // Override the way the Authorization header is set
  // getAuth: (tokenName) => ...

  // Additional ApolloClient options
  // apollo: { ... }

  // Client local data (see apollo-link-state)
  // clientState: { resolvers: { ... }, defaults: { ... } }
}

const local = createApolloClient({
  ...defaultOptions,
})

const localClient = local.apolloClient

export default localClient
