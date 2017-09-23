/**
 * Behavior interface
 */
import EventEmitter from 'eventemitter3'

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
    if (state) Behavior._delegate(this.container, this.events, this, eventNamespace)
    else this.container.off(`.${eventNamespace}`)
    this.container.toggleClass(this.constructor.name, state)
    this.container.addClass('behavior')
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

  static _delegate (el, events, context, namespace) {
    const $el = el instanceof $ ? el : $(el)
    if (!events) return
    $el.off(`.${namespace}`)

    for (let key in events) { //eslint-disable-line
      let method = events[key]
      if (!_.isFunction(method)) method = context[method]
      if (!method) continue
      if (context) method = _.bind(method, context)
      const [, eventName, selector] = key.match(/^(\S+)\s*(.*)$/)

      $el.on(`${eventName}.${namespace}`, selector, method)
    }
  }
}
