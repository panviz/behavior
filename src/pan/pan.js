/**
 * Moving of nodes canvas
 * @event change fires on every little move
 * @event end fires on finishing move
 */
import { translateX, translateY } from '@graphiy/transform'
import Behavior from '../behavior'
import './pan.scss'

export default class Pan extends Behavior {
  static get name () { return 'Pan' }
  static get defaults () {
    return {
      wheelStep: 1,
      keyStep: 30,
    }
  }
  static get controlKeys () { return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] }
  /**
   * _startPoint - coordinates of pointing device relative to the canvas
   * @param Number p.wheelStep pixels to move on mouse wheel
   * @param Number p.keyStep pixels to move on keyboard arrows
   */
  constructor (p) {
    super(p)
    this._startPoint = {}
    this._changed = false
    this._element = p.element
  }

  get events () {
    return {
      mousedown: this._onMouseDown,
      mousemove: this._onMouseMove,
      mouseup: this._end,
      mousewheel: this._onScroll,
    }
  }

  get globalEvents () {
    return {
      keydown: this._onKeyDown,
    }
  }
  /**
   * @return {x,y} current canvas absolute position
   */
  getPosition () {
    const pos = {}
    pos.x = _.toNumber(translateX(this._element))
    pos.y = _.toNumber(translateY(this._element))
    return pos
  }
  /**
   * Move canvas either absolute or relative
   */
  move (x, y, relative, silent) {
    if (relative) {
      this._moveOn(x, y)
    } else {
      this._moveTo(x, y, silent)
    }
    if (!silent) this.emit('end')
  }
  /**
   * shift canvas on specified distance {deltaX, deltaY}
   */
  _moveOn (deltaX, deltaY) {
    const current = this.getPosition()
    this._moveTo(current.x + deltaX, current.y + deltaY)
  }
  /**
   * Move canvas to absolute position {x,y}
   */
  _moveTo (x, y, silent) {
    if (x !== undefined) translateX(this._element, x)
    if (y !== undefined) translateY(this._element, y)
    if (!silent) this.emit('change')
  }
  /**
   * Sets this._startPoint
   * @param Number x absolute window coordinate where movement starts
   * @param Number y absolute window coordinate where movement starts
   */
  _start (x, y, force) {
    if (!this._enabled) return false
    this._inProgress = true
    this._changed = false
    const current = this.getPosition()

    this._startPoint.x = x - current.x
    this._startPoint.y = y - current.y
    return super._start()
  }

  _run (x, y) {
    if (!this._inProgress) return false

    // Ignore small shift
    const current = this.getPosition()
    if (Math.abs(x - this._startPoint.x - current.x) < 3 &&
         Math.abs(y - this._startPoint.y - current.y) < 3) {
      return false
    }

    this._changed = true
    const posX = x - this._startPoint.x
    const posY = y - this._startPoint.y
    this._moveTo(posX, posY)
    return super._run()
  }

  _end () {
    if (this._inProgress) {
      super._end()
    }
    this._inProgress = false
    this._changed = false
  }

  _onMouseDown (e) {
    this._start(e.pageX, e.pageY)
  }

  _onMouseMove (e) {
    this._run(e.pageX, e.pageY)
  }

  _onScroll (e) {
    let turnOff = false
    if (!this._enabled) {
      this._enabled = true
      turnOff = true
    }
    this._start(0, 0)
    if (e.shiftKey) {
      this._run(e.deltaX / this.p.wheelStep, e.deltaY / this.p.wheelStep)
    } else {
      this._run(-e.deltaX / this.p.wheelStep, -e.deltaY / this.p.wheelStep)
    }
    this._end()
    if (turnOff) this._enabled = false
  }

  _onKeyDown (e) {
    if (!this.enabled || !_.includes(Pan.controlKeys, e.key)) return

    this._start(0, 0)

    switch (e.key) {
    case 'ArrowUp':
      this._run(0, -this.p.keyStep)
      break
    case 'ArrowDown':
      this._run(0, this.p.keyStep)
      break
    case 'ArrowLeft':
      this._run(-this.p.keyStep, 0)
      break
    case 'ArrowRight':
      this._run(this.p.keyStep, 0)
      break
    default:
    }
    this._end()
  }
}
