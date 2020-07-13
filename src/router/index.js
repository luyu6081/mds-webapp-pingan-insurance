import Vue from 'vue'
import Router from 'vue-router'

import homeRoutes from './routes/home'
import searchRoutes from './routes/search'
import detailRoutes from './routes/detail'
import questionRoutes from './routes/question'

Vue.use(Router)

const router = new Router({
  linkActiveClass: 'active',
  routes: [
    ...homeRoutes,
    ...searchRoutes,
    ...detailRoutes,
    ...questionRoutes,
    {
      path: '/app-settings',
      component: () => import('@/views/app-settings/index.vue'),
      children: [
        {
          path: '',
          redirect: 'datasources',
        },
        {
          path: 'datasources',
          component: () => import('@/views/app-settings/views/datasources.vue'),
          meta: {
            authName: 'mdsSetting',
          },
        },
        {
          path: 'tech-catalog',
          name: 'tech-catalog',
          component: () => import('@/views/app-settings/views/tech-catalog/tech-catalog.vue'),
          meta: {
            authName: 'mdsSetting',
          },
        },
        {
          path: 'busi-catalog',
          component: () => import('@/views/app-settings/views/busi-catalog/busi-catalog.vue'),
          meta: {
            authName: 'mdsSetting',
          },
        },
        {
          path: 'tags',
          component: () => import('@/views/app-settings/views/tags/tags.vue'),
          meta: {
            authName: 'mdsSetting',
          },
        },
        {
          path: 'logs',
          component: () => import('@/views/app-settings/views/logs.vue'),
          meta: {
            authName: 'mdsSetting',
          },
        },
      ],
    },
    {
      path: '/app-settings/tech-category/:categoryId/schedule',
      name: 'tech-schedule',
      component: () => import('@/views/app-settings/views/category-schedule.vue'),
      props: true,
    },
    {
      path: '/data-map',
      name: 'data-map',
      component: () => import('@/views/data-map.vue'),
    },
    {
      path: '/playground',
      name: 'playground',
      redirect: process.env.NODE_ENV === 'development' ? undefined : '/',
      component: () => import('@/views/playground.vue'),
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})

export default router
