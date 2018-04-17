/*
 * Selection by click
 * allows multiple
 */
import Behavior from '../behavior'

export default class Selectioning extends Behavior {
  constructor (p) {
    super(p)
    this.modeKey = 'ctrlKey'

    this.selection = p.selection
    this._nodeSelector = p.node.selector
  }

  get events () {
    const node = this.p.node.selector
    return {
      [`mousedown ${node}`]: this._onMouseDownNode,
      [`mouseup ${node}`]: this._onMouseUpNode,
      mousedown: this._onMouseDownBase,
    }
  }

  _onMouseDownBase (e) {
    if (e.target !== e.currentTarget) return
    if (e[this.modeKey] === false) this.selection.clear()
  }

  _onMouseDownNode (e) {
    this.key = e.currentTarget.__data__

    if (e[this.modeKey] === false) {
      this.selection.add(this.key)
    } else if (this.selection.get(this.key)) {
      this.selection.remove(this.key)
    } else {
      this.selection.add(this.key)
    }
  }

  _onMouseUpNode (e) {
    const key = e.currentTarget.__data__
    if (this.key === key) {
      const selected = this.selection.getAll()

      // deselect all except current
      if (e[this.modeKey] === false) {
        const unselect = _.without(selected, key)
        this.selection.remove(unselect)
      }
    }
    delete this.key
  }
}
