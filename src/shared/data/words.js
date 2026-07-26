// word-data.json の再エクスポート（パス集約）
import wordData from './word-data.json'

export default wordData
export const allWords = wordData.categories.flatMap(c => c.words)
