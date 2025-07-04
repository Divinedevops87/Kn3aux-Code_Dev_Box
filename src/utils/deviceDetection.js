export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768)
}

export const isTouch = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}