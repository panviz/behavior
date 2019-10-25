/**
 * Drag behavior
 */
import { translate } from '@graphiy/transform'
import Behavior from '../behavior'
import { getRelativeOffset, isVisible } from '../util'
import './drag.scss'
/**
 * this._dragged - node on which dragging started
 * this._draggedClone - copy of the node on which dragging started - to visualize dragging
 * this._target - node on which dragged node is dropped
 */
export default class Drag extends Behavior {
  static get name () { return 'Drag' }
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
  _start (e, currentTarget) {
    if (!this._enabled) return false
    this._dragged = currentTarget
    this._draggedClone = this._dragged.cloneNode(true)
    this._draggedClone.classList.add('dragging')
    this.eventOffset = { x: e.offsetX, y: e.offsetY }
    const offset = getRelativeOffset(e, this.container)
    this._startPoint = { x: offset.x, y: offset.y }
    this.container.appendChild(this._draggedClone)
    translate(this._draggedClone, offset.x - this.eventOffset.x, offset.y - this.eventOffset.y)
    return super._start()
  }

  _run (e) {
    if (!this._inProgress) return false
    const offset = getRelativeOffset(e, this.container)
    if (Math.abs(offset.x - this._startPoint.x) < 3 &&
         Math.abs(offset.y - this._startPoint.y) < 3) return false

    if (!isVisible(this._draggedClone)) {
      this._draggedClone.show()
    }
    translate(this._draggedClone, offset.x - this.eventOffset.x, offset.y - this.eventOffset.y)
    return super._run()
  }

  _prepareDrop (e, currentTarget) {
    if (!this._inProgress) return

    // restrict self dropping
    if (currentTarget === this._dragged) return
    this._target = currentTarget
    this._target.classList.add('dropTarget')
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
      delete this._target
    } else {
      const offset = getRelativeOffset(e, this.container)
      const delta = {}
      delta.x = offset.x - this._startPoint.x
      delta.y = offset.y - this._startPoint.y

      if (Math.abs(delta.x) > this.p.moveThreshold || Math.abs(delta.y) > this.p.moveThreshold) {
        this.emit('move', delta, this._dragged)
      }
    }

    delete this._startPoint
    delete this._dragged
    this._disposeDrop()
  }
}
