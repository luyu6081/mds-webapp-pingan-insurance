/**
 * 递归找出子元素
 * @param {*} recuData 目标项
 * @param {*} sourceData 原数据
 */

const recursiveNextChild = (recuData, sourceData) => {
  let children = []
  sourceData.map(sd => String(sd.next[0]) === recuData.id && (recursiveNextChild(sd, sourceData), children.push(sd)))

  if (children.length > 0) recuData.children = children
  return recuData
}

const recursivePrevChild = (recuData, sourceData) => {
  let children = []
  sourceData.map(sd => String(sd.prev[0]) === recuData.id && (recursivePrevChild(sd, sourceData), children.push(sd)))

  if (children.length > 0) recuData.children = children
  return recuData
}

/**
 * 获取tree层级
 * @param {*} treeData 生成的tree
 * @param {*} _analysisData  表格数据
 */
const getTier = (treeData, _analysisData) => {
  let max = 0
  function each (data, tier) {
    data.map(e => {
      e.tier = tier

      _analysisData.map(ad => {
        if (ad.id === e.id) {
          ad.tier = e.tier
        }
        return ad
      })

      if (tier > max) {
        max = tier
      }

      if (e.children.length > 0) {
        each(e.children, tier + 1)
      }
    })
  }
  each(treeData, 1)
  return max
}

/**
 * 生成charts需要的tree
 * @param {*} analysisData 分析的基础数据
 * @param {*} analysisId 当前被分析的mdsObjectId
 */
const generateTree = (analysisData, analysisId, analysisType) => {
  analysisId = String(analysisId)
  let edges = analysisData.edges
  let nodes = analysisData.nodes
  let _nodes = nodes

  let aTree = []
  let rootNode = nodes.find(n => String(n.id) === analysisId)

  if (!rootNode) {
    return {
      tree: {},
      table: [],
    }
  }

  // 取出每个节点的上游节点和下游节点
  let _analysisData = nodes.map(c => {
    // 上游节点
    c.prev = edges.filter(eg => String(eg[1]) === String(c.id)).map(e => String(e[0]))

    // 下游节点
    c.next = edges.filter(eg => String(eg[0]) === String(c.id)).map(e => String(e[1]))

    // 存储下游节点
    c.children = []

    // 存储上游节点
    c.parent = []

    // 层级
    c.tier = 0

    return c
  })

  if (analysisType === 'blood') {
    _analysisData.forEach(ad => {
      aTree.push(recursiveNextChild(ad, _analysisData))
    })

    rootNode.children = aTree.filter(a => {
      if (String(a.next[0]) === analysisId) {
        return a
      }
    })
  } else if (analysisType === 'effect') {
    _analysisData.forEach(ad => {
      aTree.push(recursivePrevChild(ad, _analysisData))
    })

    rootNode.children = aTree.filter(a => {
      if (String(a.prev[0]) === analysisId) {
        return a
      }
    })
  }

  getTier([rootNode], _nodes)

  // 此操作： 去掉children 防止表格已tree的形式展示
  _nodes = _nodes.map(n => {
    return {
      databaseName: n.databaseName,
      platformName: n.platformName,
      desc: n.desc,
      name: n.name,
      columnName: n.columnName,
      type: n.type,
      sourceNum: n.sourceNum,
      targetNum: n.targetNum,
      onlyOnPhysics: n.onlyOnPhysics,
      tableSpace: n.tableSpace,
      recordNum: n.recordNum,
      tier: n.tier,
      next: n.next,
      prev: n.prev,
    }
  })

  return {
    tree: rootNode,
    table: _nodes,
  }
}

export default {
  generateTree,
}
