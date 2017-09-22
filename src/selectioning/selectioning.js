/*
 * Selection by click
 * allows multiple
 */
import Behavior from '../behavior'
import './selectioning.scss'

export default class Selectioning extends Behavior {
  constructor (p) {
    super(p)
    this.modeKey = 'ctrlKey'

    this.selection = p.selection
    this._nodeSelector = p.node.selector
  }

  get events () {
    return {
      [`mousedown ${this._nodeSelector}`]: this._onMouseDownNode,
      [`mouseup ${this._nodeSelector}`]: this._onMouseUpNode,
      mousedown: this._onMouseDownBase,
    }
  }

  _onMouseDownBase (e) {
    if (e.target !== e.currentTarget) return
    if (e[this.modeKey] === false) this.selection.clear()
  }

  _onMouseDownNode (e) {
    const key = e.currentTarget.__data__

    if (e[this.modeKey] === false) {
      this.selection.add(key)
    } else {
      if (this.selection.get(key)) {
        this.selection.remove(key)
      } else {
        this.selection.add(key)
      }
    }
  }

  _onMouseUpNode (e) {
    const key = e.currentTarget.__data__
    const selected = this.selection.getAll()

    // deselect all except current
    if (e[this.modeKey] === false) {
      const unselect = _.without(selected, key)
      this.selection.remove(unselect)
    }
  }
}
