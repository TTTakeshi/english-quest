import wordData from '@/shared/data/words'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getDistractors(correctWord, allWords, key, count = 3) {
  const uniqueVals = [...new Set(
    allWords
      .filter(w => w.id !== correctWord.id)
      .map(w => w[key])
  )].filter(v => v !== correctWord[key])
  return shuffle(uniqueVals).slice(0, count)
}

export function generateQuestion(words, allWords, isBossPhase = false, forcedWord = null) {
  // ボス戦: 50%の確率で穴埋め問題
  if (isBossPhase && Math.random() < 0.5 && wordData.fillInTemplates?.length > 0) {
    const tpl = wordData.fillInTemplates[Math.floor(Math.random() * wordData.fillInTemplates.length)]
    return {
      type: 'fill_in',
      prompt: tpl.prompt,
      answer: tpl.answer,
      choices: shuffle([tpl.answer, ...tpl.distractors]),
      hint: tpl.hint,
      wordData: null,
    }
  }

  const word = forcedWord ?? words[Math.floor(Math.random() * words.length)]
  const type = Math.random() < 0.5 ? 'ja_to_en' : 'en_to_ja'

  if (type === 'ja_to_en') {
    const distractors = getDistractors(word, allWords, 'en')
    return {
      type,
      prompt: `「${word.ja}」を英語にすると？`,
      answer: word.en,
      choices: shuffle([word.en, ...distractors]),
      hint: `最初の文字: ${word.en[0].toUpperCase()}`,
      wordData: word,
    }
  } else {
    const distractors = getDistractors(word, allWords, 'ja')
    return {
      type,
      prompt: `"${word.en}" の意味は？`,
      answer: word.ja,
      choices: shuffle([word.ja, ...distractors]),
      hint: `ヒント: ${word.ja[0]}...`,
      wordData: word,
    }
  }
}
