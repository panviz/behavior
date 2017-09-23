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
    this._startPoint = { x: e.offsetX, y: e.offsetY }

    this.container.append(this._draggedClone)
    return super._start()
  }

  _run (e) {
    if (!this._inProgress) return false
    if (Math.abs(e.offsetX - this._startPoint.x) < 3 &&
         Math.abs(e.offsetY - this._startPoint.y) < 3) return false

    if (!this._draggedClone.is(':visible')) {
      this._draggedClone.show()
    }
    this._draggedClone.translate(e.offsetX, e.offsetY)
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
      const delta = {}
      delta.x = e.offsetX - this._startPoint.x
      delta.y = e.offsetY - this._startPoint.y

      if (Math.abs(delta.x) > this.p.moveThreshold || Math.abs(delta.y) > this.p.moveThreshold) {
        this.emit('move', delta, this._dragged[0])
      }
    }

    delete this._startPoint
    delete this._dragged
    this._disposeDrop()
  }
}
