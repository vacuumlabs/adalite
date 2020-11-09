import {isBip39Word} from '../wallet/mnemonic'
import matchAll from './matchAll'

const underlineNonBip39words = (toFormat) => {
  // 1. forbid multiple divs (lines)
  toFormat = toFormat.replace(/<\/{0,1}(div|br|p)[^<>]*>/g, '')

  // 2. only non-breaking space allowed as whitespace
  toFormat = toFormat.replace(/\s|&nbsp;/g, ' ')

  // 3. wrap span around words at the start of line
  // ^[^<>a-zA-Z]*   - find start of line and absence of '<' and '>'
  // [a-zA-Z]+       - find word itself
  // (\s|[,;])+<span - find next opening tag '<span'
  toFormat = toFormat.replace(/(^[^<>a-zA-Z]*)([a-zA-Z]+)((\s|[,;])+<span)/g, '$1<span>$2</span>$3')

  // 4. wrap span around words in the middle of line
  // <\/span>(\s|[,;])+ - find '</span>' before word
  // [a-zA-Z]+          - find word itself
  // (\s|[,;])+<span    - find '<span' after word
  toFormat = toFormat.replace(
    /(<\/span>(\s|[,;])+)([a-zA-Z]+)((\s|[,;])+<span)/g,
    '$1<span>$3</span>$4'
  )

  // 5. wrap span around words in the end of the line
  // (?<=^|\s|[,;]) - check for delimiter before word
  // [a-zA-Z]+      - find word itself
  // (?=$|\s|[,;])  - check for delimiter after word
  // (?=[^<>]*$)    - check for absence of '<' or '>' after word to prevent
  //                  wrapping tags inside span, like <span class="a b c">
  toFormat = toFormat.replace(/(?<=^|\s|[,;])[a-zA-Z]+(?=$|\s|[,;])(?=[^<>]*$)/g, '<span>$&</span>')

  // 6. split words by whitespace or commas
  // (?<!<span)    - check if space before word is inside span tag,
  //                 we don't want to split that; eg. <span class="bip-39">
  // (?<![>,;]|\s) - check for '>' symbol from previous span tag
  // (\s|[,;])+    - find whitespaces or commas
  // (?!\s|[<,;])  - check for '<' symbol from next span tag
  toFormat = toFormat.replace(/(?<!<span)(?<![>,;]|\s)(\s|[,;])+(?!\s|[<,;])/g, '</span>$&<span>')

  // 7. merge words if there is no delimiter between them
  toFormat = toFormat.replace(/<\/span><span[^>]*>/g, '')

  // 8. append to wrapped word
  // <span[^<>]*> - find opening tag <span class="..."> before word
  // [a-zA-Z]+    - find word itself
  // <\/span>     - find closing tag </span> after word
  // [a-zA-Z]+    - find text to append
  toFormat = toFormat.replace(/(<span[^<>]*>[a-zA-Z]+)(<\/span>)([a-zA-Z]+)/g, '$1$3$2')

  // 9. preppend to wrapped word
  // [a-zA-Z]+    - find text to prepend
  // <span[^<>]*> - find opening tag <span class="..."> before word
  // [a-zA-Z]+    - find word itself
  // <\/span>     - find closing tag </span> after word
  toFormat = toFormat.replace(/([a-zA-Z]+)(<span[^<>]*>)([a-zA-Z]+)(<\/span>)/g, '$2$1$3$4')

  // 10. extract delimiters outside of spans
  // <span[^<>]*> - find opening tag <span class="..."> before word
  // (\s|[,;])*   - find delimiters to the left of word
  // [a-zA-Z]+    - find word itself
  // (\s|[,;])*   - find delimiters to the right of word
  // <\/span>     - find closing tag </span> after word
  toFormat = toFormat.replace(
    /(<span[^<>]*>)(\s|[,;])*([a-zA-Z]+)(\s|[,;])*(<\/span>)/g,
    '$2$1$3$5$4'
  )

  // 11 remove empty spans
  toFormat = toFormat.replace(/<span[^>]*><\/span>/g, '')

  // 12. translate non-breaking space back to html
  // warning: this translates spaces inside span attributes as well,
  // but it doesn't matter for the next steps
  toFormat = toFormat.replace(/\s/g, '&nbsp;')

  // 13. extract raw words into array
  // <span[^>]*> - find opening tag
  // [^<>]*      - find element content
  // <\/span>)   - find closing tag
  const words = matchAll(/<span[^>]*>[^<>]*<\/span>/g, toFormat).map((wrappedWord) =>
    wrappedWord.replace(/(<span[^>]*>)([^<>]*)(<\/span>)/g, '$2').replace(/(\s|[,;])/g, '')
  )

  // 14. reapply style rules to each word
  const areWordsBipP39 = words.map((word) => isBip39Word(word)).reverse()
  const formattedText = toFormat.replace(
    /(<span[^>]*>)([^<>]*)(<\/span>)/g,
    (match, p1, p2, p3, offset, string) => {
      const style = areWordsBipP39.pop() ? '' : ' class="not-bip-39"'
      return `<span${style}>${p2}${p3}`
    }
  )
  const rawText = words.join(' ')

  return {formattedText, rawText}
}

export {underlineNonBip39words}
