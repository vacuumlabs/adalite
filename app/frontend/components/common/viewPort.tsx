import {ScreenType} from '../../types'
import {useState, useEffect} from 'preact/hooks'

// we could export this and use it in other places, in that case
// we should optimalize it with context
// https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/
const useViewport = (): ScreenType => {
  const [screenType, setScreenType] = useState<ScreenType>(undefined)

  const handleScreenResize = () => {
    if (window.innerWidth < 768) {
      setScreenType(ScreenType.MOBILE)
    } else if (window.innerWidth <= 1024) {
      setScreenType(ScreenType.TABLET)
    } else {
      setScreenType(ScreenType.DESKTOP)
    }
  }

  useEffect(() => {
    handleScreenResize()
    window.addEventListener('resize', handleScreenResize)

    return () => window.removeEventListener('resize', handleScreenResize)
  }, [])

  return screenType
}

const isSmallerThanDesktop = (screenType: ScreenType): boolean => {
  return [ScreenType.MOBILE, ScreenType.TABLET].includes(screenType)
}

const isBiggerThanMobile = (screenType: ScreenType): boolean => {
  return [ScreenType.TABLET, ScreenType.DESKTOP].includes(screenType)
}

export {useViewport, isSmallerThanDesktop, isBiggerThanMobile}
