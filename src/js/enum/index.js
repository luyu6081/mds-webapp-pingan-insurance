import detail from './detail'

let obj = Object.assign(
  {},
  detail,
)

function enumerate () {
  let ENUM = []
  for (let k in obj) {
    ENUM[k] = obj[k]
    obj[k].forEach(item => {
      ENUM[k][item.key] = item
    })
  }
  window.ENUM = ENUM
}

enumerate()

export default window.ENUM
