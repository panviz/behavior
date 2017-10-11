/**
 * Drag behavior
 */
import Behavior from '../behavior'
import './drag.scss'

/**
 * this._dragged - node on which dragging started
 * this._draggedClone - copy of the node on which dragging started - to visualize dragging
 * this._target - node on which dragged node is dropped
 */
export default class Drag extends Behavior {
  static _getRelativeOffset (e, ancestor) {
    const target = e.target
    let offsetX = e.offsetX
    let offsetY = e.offsetY

    function getOffset (element) {
      if (element === ancestor) return


      if (element.style.transform) {
        const matrix = $(element).transform()
        offsetX += matrix[4]
        offsetY += matrix[5]
      } else {
        offsetX += element.offsetLeft
        offsetY += element.offsetTop
      }

      getOffset(element.parentNode)
    }
    getOffset(target)
    return { x: offsetX, y: offsetY }
  }

  get events () {
    const node = this.p.node.selector
    return {
      [`mousedown ${node}`]: this._start,
      mousemove: this._run,
      [`mouseenter ${node}`]: this._prepareDrop,
      [`mouseleave ${node}`]: this._disposeDrop,
      [`mouseup ${node}`]: this._end,
      mouseup: this._end,
    }
  }
  /**
   * TODO show all selected nodes while dragging?
   */
  _start (e) {
    if (!this._enabled) return false
    this._dragged = $(e.currentTarget)
    this._draggedClone = this._dragged.clone().addClass('dragging')
    this.eventOffset = { x: e.offsetX, y: e.offsetY }
    const offset = Drag._getRelativeOffset(e, this.container[0])
    this._startPoint = { x: offset.x, y: offset.y }
    this.container.append(this._draggedClone)
    this._draggedClone.translate(offset.x - this.eventOffset.x, offset.y - this.eventOffset.y)
    return super._start()
  }

  _run (e) {
    if (!this._inProgress) return false
    const offset = Drag._getRelativeOffset(e, this.container[0])
    if (Math.abs(offset.x - this._startPoint.x) < 3 &&
         Math.abs(offset.y - this._startPoint.y) < 3) return false

    if (!this._draggedClone.is(':visible')) {
      this._draggedClone.show()
    }
    this._draggedClone.translate(offset.x - this.eventOffset.x, offset.y - this.eventOffset.y)
    return super._run()
  }

  _prepareDrop (e) {
    if (!this._inProgress) return

    // restrict self dropping
    if (e.currentTarget === this._dragged[0]) return
    this._target = $(e.currentTarget)
    this._target.addClass('dropTarget')
  }

  _disposeDrop (e) {
    if (!this._inProgress || !this._target) return
    this._target.removeClass('dropTarget')
    delete this._target
  }

  _end (e) {
    if (!this._inProgress) return
    this._draggedClone.remove()
    super._end()

    if (this._target) {
      this.emit('drop', this._target, this._dragged)
    } else {
      const offset = Drag._getRelativeOffset(e, this.container[0])
      const delta = {}
      delta.x = offset.x - this._startPoint.x
      delta.y = offset.y - this._startPoint.y

      if (Math.abs(delta.x) > this.p.moveThreshold || Math.abs(delta.y) > this.p.moveThreshold) {
        this.emit('move', delta, this._dragged[0])
      }
    }

    delete this._startPoint
    delete this._dragged
    this._disposeDrop()
  }
}
