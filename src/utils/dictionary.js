/** 数据类型 */
export const MdsObjectTypeEnum = {
  none: 'NONE', // 无
  database: 'TABLE', // 数据表
  datafile: 'FILE', // 数据文件
  interface: 'INTERFACE', // 数据接口
}

/** 模板文件类型 */
export const TemplateFileTypeEnum = {
  platform: 'PLATFORM', // 平台
}

/** 技术-类目等级 */
export const CategoryTechLevel = {
  none: -1,
  system: 0,
  application: 1,
  database: 2,
}

/** 调度周期 */
export const ScheduledTypeEnum = {
  day: 'DAY', // 天
  week: 'WEEK', // 周
  month: 'MONTH', // 月
}

/** Mds菜单状态 */
export const CategoryStatusEnum = {
  available: 'AVAILABLE', // 可用
  disable: 'DISABLE', // 不可用
}

/** 上传方式 */
export const MdsUpdateTypeEnum = {
  totalamount: 'TOTALAMOUNT', // 全量
  increment: 'INCREMENT', // 增量
}

/** 数据库类型 */
export const DbTypeEnum = {
  MongoDB: 'MONGODB',
  ElasticSearch: 'ELASTICSEARCH',
  HBase: 'HBASE',
}
