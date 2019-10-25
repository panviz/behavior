/**
 * Behavior interface
 */
import EventEmitter from 'eventemitter3'
import { on, off } from './events'

export default class Behavior extends EventEmitter {
  constructor (options) {
    super()
    const p = _.cloneDeep(options)
    this.p = _.defaultsDeep(p, this.constructor.defaults)
    this.container = p.container
    this._enabled = false
    this._inProgress = false
    if (p.enabled) this.enable()
  }

  set enabled (state) {
    if (this._enabled === state) return false
    this._enabled = state
    const eventNamespace = this.constructor.name
    if (state) this._setHandlers(this.container, this.events)
    else off(this.container, `.${eventNamespace}`)
    if (state) this._setHandlers(document, this.globalEvents)
    else off(this.container, `.${eventNamespace}`)
    this.container.classList.toggle(this.constructor.name, state)
    this.container.classList.add('behavior')
    this.emit('enabled', this._enabled)
    return true
  }

  get enabled () {
    return this._enabled
  }

  get state () {
    return this._inProgress
  }
  /**
   * Convenience method
   */
  enable () {
    this.enabled = true
  }
  /**
   * Convenience method
   */
  disable () {
    this.enabled = false
  }
  /**
   * Convenience method
   */
  isEnabled () {
    return this._enabled
  }

  _start () {
    if (!this._enabled) return false
    this._inProgress = true
    this.emit('start')
    return true
  }

  _run () {
    if (!this._inProgress) return false
    this.emit('run')
    return true
  }
  /**
   * End function may be useful alone
   * (without preceeding start / run
   */
  _end () {
    this._inProgress = false
    this.emit('end')
  }

  _setHandlers (target, events) {
    const namespace = this.constructor.name
    if (!events) return
    off(target, `.${namespace}`)

    for (let key in events) { //eslint-disable-line
      let method = events[key]
      if (!_.isFunction(method)) method = this[method]
      if (!method) continue
      method = method.bind(this)
      const [, eventName, selector] = key.match(/^(\S+)\s*(.*)$/)
      on(target, `${eventName}.${namespace}`, method, selector)
    }
  }
}
