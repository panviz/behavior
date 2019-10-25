import { translate } from '@graphiy/transform'

export function getRelativeOffset (e, ancestor) {
  const target = e.target
  let offsetX = e.offsetX
  let offsetY = e.offsetY

  function getOffset (element) {
    if (element === ancestor) return

    if (element.style.transform) {
      const transform = translate(element)
      offsetX += transform[0]
      offsetY += transform[1]
    } else {
      offsetX += element.offsetLeft
      offsetY += element.offsetTop
    }

    getOffset(element.parentNode)
  }
  getOffset(target)
  return { x: offsetX, y: offsetY }
}

export function isVisible (el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
}
