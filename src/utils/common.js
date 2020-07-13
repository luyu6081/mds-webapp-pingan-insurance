import runtimeArgs from '@/runtime-args'
/**
 * 拼接后端返回的图片key
 * @param val {String} - 字符串
 * @return {String} - 图片地址
 */
export function toImgHref (val) {
  if (!val) return ''
  return `${runtimeArgs.VUE_APP_DOWNLOAD_HTTP}?ambryId=${val}&show=true`
}
