const matchAll = (regex: RegExp, str: string) => {
  const words: string[] = []
  let it
  while ((it = regex.exec(str)) !== null) {
    words.push(it[0])
  }
  return words
}

export default matchAll
