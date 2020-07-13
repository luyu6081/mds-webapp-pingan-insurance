export default [
  {
    path: '/questions',
    name: 'question-index',
    component: () => import('@/views/question/index.vue'),
  },
  {
    path: '/question/:questionId',
    name: 'question-detail',
    component: () => import('@/views/question/detail.vue'),
  },
]
