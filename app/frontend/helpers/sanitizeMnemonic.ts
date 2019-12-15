/*
 Function that takes mnemonic string and replace all commas with spaces
 and than replace all multispaces with single space. Finally trims the empty
 characters from beginning and end of the string
*/
const sanitizeMnemonic = (mnemonic) =>
  mnemonic
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export default sanitizeMnemonic
