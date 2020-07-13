import Vue from 'vue'
import VueApollo from 'vue-apollo'
import {createApolloClient, restartWebsockets} from 'vue-cli-plugin-apollo/graphql-client'
import {errorLink, addDatesLink} from '@/utils/http'

import runtimeArgs from '@/runtime-args'
// import localClient from './local-apollo.js'
import ucClient from './uc-apollo.js'

// Install the vue plugin
Vue.use(VueApollo)

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

// Http endpoint
const httpEndpoint = runtimeArgs.VUE_APP_GRAPHQL_HTTP || 'http://localhost:4000/graphql'
// Files URL root
export const filesRoot = runtimeArgs.VUE_APP_FILES_ROOT || httpEndpoint.substr(0, httpEndpoint.indexOf('/graphql'))

Vue.prototype.$filesRoot = filesRoot

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

  httpLinkOptions: {
    includeExtensions: true,
    credentials: 'include', // 作用：每个请求都携带cookie
  },

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  // link: myLink
  link: errorLink.concat(addDatesLink),
  // Override default cache
  // cache: myCache

  // Override the way the Authorization header is set
  // getAuth: (tokenName) => ...

  // Additional ApolloClient options
  // apollo: { ... }

  // Client local data (see apollo-link-state)
  // clientState: { resolvers: { ... }, defaults: { ... } }
}

const userOptions = {
  httpEndpoint,
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  persisting: false,
  websocketsOnly: false,
  ssr: false,
  httpLinkOptions: {
    includeExtensions: true,
    credentials: 'include', // 作用：每个请求都携带cookie
  },
}

// Call this in the Vue app file
export function createProvider (options = {}) {
  // Create apollo client
  const {apolloClient, wsClient} = createApolloClient({
    ...defaultOptions,
    ...options,
  })

  const createUserClient = createApolloClient({
    ...userOptions,
    ...options,
  })

  apolloClient.wsClient = wsClient

  const apolloUserClient = createUserClient.apolloClient

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    clients: {
      ucClient,
      // localClient,
      apolloClient,
      apolloUserClient,
    },
    defaultOptions: {
      $query: {
        // fetchPolicy: 'cache-and-network',
      },
    },
    errorHandler (error) {
      // eslint-disable-next-line no-console
      console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;', error.message)
    },
  })

  return apolloProvider
}

// Manually call this when user log in
export async function onLogin (apolloClient, token) {
  if (typeof localStorage !== 'undefined' && token) {
    localStorage.setItem(AUTH_TOKEN, token)
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (login)', 'color: orange;', e.message)
  }
}

// Manually call this when user log out
export async function onLogout (apolloClient) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN)
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
  }
}
export const apolloProvider = createProvider()
export function useApollo () {
  return apolloProvider.defaultClient
}
