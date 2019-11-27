/*
 Source: https://gist.github.com/iperelivskiy/4110988
*/
const getHash = function(s) {
  let h = 0xdeadbeef
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 2654435761)
  }
  return ((h ^ (h >>> 16)) >>> 0).toString(16)
}

export default getHash
