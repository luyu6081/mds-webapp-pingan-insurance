// Enable mocking in vue.config.js with `"pluginOptions": { "enableMocks": true }`
// Customize mocking: https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks
// import shortid from 'shortid'
import Mock from 'mockjs'

const Random = Mock.Random

function randomNumber (range = [0, 100]) {
  const [min, max] = typeof range === 'number' ? [0, range] : range
  return min + Math.floor(Math.random() * (max - min + 1))
}

function genMdsObject () {
  const num = randomNumber(1000)
  return {
    name: 'whatever_data_object_' + num,
    nameAlt: '某个数据对象_' + num,
  }
}

function genUser () {
  return {
    id: Random.id(),
    name: Random.cname(),
    avatar: Random.image('15x15', Random.color(), Random.cfirst()),
  }
}

// 生成评论内容
function genMdsComments () {
  return {
    id: Random.id(),
    time: Random.datetime(),
    content: Random.cparagraph(1, 2),
    replyNum: Random.natural(0, 1000),
    user: genUser(),
  }
}

// 生成提问列表
function genMdsQuestion () {
  return {
    id: Random.id(),
    time: Random.datetime(),
    title: Random.ctitle() + '？',
    replyNum: Random.natural(0, 1000),
    user: genUser(),
  }
}

export default {
  Query: () => ({
    mdsFavorites: () => {
      return Array.from({length: randomNumber([1, 5])}).map(_ => genMdsObject())
    },
    mdsUpdates: () => {
      return Array.from({length: randomNumber([1, 5])}).map(_ => genMdsObject())
    },
    mdsVisited: () => {
      return Array.from({length: randomNumber([1, 5])}).map(_ => genMdsObject())
    },
    mdsRecommended: () => {
      return Array.from({length: randomNumber([1, 5])}).map(_ => genMdsObject())
    },
    mdsQuestionDetail: () => {
      return {
        id: Random.id(),
        title: Random.ctitle() + '？',
        content: Random.cparagraph(1, 2),
        user: genUser(),
        comments: Array.from({length: randomNumber([0, 10])}).map(_ => genMdsComments()),
      }
    },
    mdsQuestionList: () => {
      return Array.from({length: randomNumber([3, 10])}).map(_ => genMdsQuestion())
    },
  }),
}
