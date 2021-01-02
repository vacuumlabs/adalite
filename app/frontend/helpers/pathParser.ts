import {HARDENED_THRESHOLD} from './../wallet/constants'

export const parsePath = (path: number[], hardened = true) => {
  const hardenedPart = hardened
    ? path.slice(0, 3).map((el: number) => el - HARDENED_THRESHOLD)
    : path.slice(0, 3)
  return `${hardenedPart.join("'/")}'/${path.slice(3).join('/')}`
}
