export default [
  {
    path: '/detail',
    redirect: '/',
  },
  {
    path: '/detail/:dataId',
    name: 'detail',
    component: () => import('@/views/detail/index.vue'),
  },
]
