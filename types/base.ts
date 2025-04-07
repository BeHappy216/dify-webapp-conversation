export type TypeWithI18N<T = string> = {
  'en-US': T
  'zh-Hans': T
  [key: string]: T
}
