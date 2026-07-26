// word-data.json の再エクスポート（パス集約）
import baseWordData from './word-data.json'
import { grade1CoreWords, grade2CoreWords, grade3CoreWords } from './jhs-core-words'

function buildGradeCategory(id, name, icon, words, startId) {
	return {
		id,
		name,
		icon,
		words: words.map((w, index) => ({
			id: startId + index,
			...w,
		})),
	}
}

const maxExistingId = Math.max(...baseWordData.categories.flatMap(c => c.words.map(w => w.id)))

const grade1Category = buildGradeCategory('j1_core', '中1総合語彙', '1️⃣', grade1CoreWords, maxExistingId + 1)
const grade2Category = buildGradeCategory('j2_core', '中2総合語彙', '2️⃣', grade2CoreWords, maxExistingId + 1 + grade1CoreWords.length)
const grade3Category = buildGradeCategory('j3_core', '中3総合語彙', '3️⃣', grade3CoreWords, maxExistingId + 1 + grade1CoreWords.length + grade2CoreWords.length)

const categories = [...baseWordData.categories, grade1Category, grade2Category, grade3Category]

const wordData = {
	...baseWordData,
	categories,
	totalWords: categories.reduce((sum, c) => sum + c.words.length, 0),
}

export default wordData
export const allWords = wordData.categories.flatMap(c => c.words)
