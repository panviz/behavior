import * as d3Selection from 'd3-selection'
import Collection from '@graphiy/collection'
import { Grid } from '@graphiy/layout'

import Pan from '../src/pan/pan'
import Drag from '../src/drag/drag'
import Selectioning from '../src/selectioning/selectioning'

import './app.scss'
import data from './data.json'

export default class App {
  constructor () {
    this.selection = new Collection
    this.container = d3Selection.select('.container')
    this.graph = $('.graph')
    const Behaviors = {
      pan: {
        Klass: Pan,
        p: {
          element: this.graph.find('.canvas'),
        },
      },
      drag: {
        Klass: Drag,
        p: {
          node: {
            selector: '.node',
          },
          moveThreshold: 16,
        },
      },
      selectioning: {
        Klass: Selectioning,
        p: {
          selection: this.selection,
          node: {
            selector: '.node',
          },
        },
      },
    }
    this.behaviors = {}
    _.each(Behaviors, (config, name) => {
      _.extend(config.p, { container: this.graph })
      this.behaviors[name] = new config.Klass(config.p)
    })

    this.behaviors.drag.on('drop', App.onDrop, this)
    this.behaviors.drag.on('move', this._onNodeMove, this)

    this.selection.on('add', this._onSelect, this)
    this.selection.on('remove', this._onDeselect, this)


    this.renderControls()
    this.layout = new Grid({
      width: this.graph[0].getBoundingClientRect().width,
      node: { width: 144, height: 32 },
      offset: { x: 8, y: 8 },
    })
    this.renderData()
  }

  renderControls () {
    const controls = d3Selection.select('.controls').selectAll('div')
      .data(_.values(this.behaviors))
      .enter()
    const behaviorControls = controls
      .append('div')
      .attr('class', d => d.constructor.name)
      .html(d => d.constructor.name)
    behaviorControls
      .append('div')
      .attr('class', 'btn enable')
      .on('click', (d) => { d.enabled = !d.enabled })
      .each((d, i, els) => {
        d.on('enabled', state => $(els[i]).toggleClass('active', state))
      })
    behaviorControls
      .append('div')
      .attr('class', 'is-in-progress')
      .each((d) => {
        function statusHighlight () {
          d3Selection.select(`.controls .${d.constructor.name}`).classed('active', d.state)
        }
        d.on('start', statusHighlight)
        d.on('run', statusHighlight)
        d.on('end', statusHighlight)
      })

    d3Selection.select('.Drag')
      .append('div')
      .classed('notification', true)
      .append('div')
      .html('Dragged')
      .classed('dragged', true)

    d3Selection.select('.Selectioning')
      .append('div')
      .classed('notification', true)
      .append('div')
      .html('Select')
      .classed('select', true)
  }

  renderData () {
    this.updateNodes = this.container.select('.graph .canvas').selectAll('.node').data(data.graph)
    this.enterNodes = this.updateNodes.enter()
      .append('div')
      .attr('class', 'node')
      .style('background', d => d)
      .html(d => d)
    this.nodes = this.updateNodes.merge(this.enterNodes)
    this.layout.update(data.graph)
    this.layout.on('end', this.updatePosition, this)
    this.layout.run()
  }

  updatePosition () {
    const { coords } = this.layout
    const nodes = $('.node')
    _.each(nodes, (node, i) => {
      const coord = coords[i]
      $(node).css({ transform: `translate(${coord.x}px, ${coord.y}px)` })
    })
  }

  static onDrop (targetNode) {
    if (!targetNode) return
    d3Selection.select('.Drag .notification')
      .style('opacity', 1)
    d3Selection.select('.dragged')
      .classed('active', true)
    setTimeout(() => {
      d3Selection.select('.notification')
        .style('opacity', 0)
      d3Selection.select('.dragged')
        .classed('active', false)
    }, 1000)
  }

  _onNodeMove (delta, node) {
    let keys = this.selection.getAll()
    if (_.isEmpty(keys) && node) keys = [node.__data__]
    _.each(keys, (key) => {
      const _node = _.find(this.nodes.nodes(), __node => __node.__data__ === key)
      const item = _node.__data__
      this.layout.move(data.graph.indexOf(item), delta)
    })
    this.updatePosition()
  }

  _onSelect (keys) {
    d3Selection.select('.Selectioning .notification')
      .style('opacity', 1)
    d3Selection.select('.select')
      .classed('active', true)
    setTimeout(() => {
      d3Selection.select('.Selectioning .notification')
        .style('opacity', 0)
      d3Selection.select('.select')
        .classed('active', false)
    }, 1000)
    _.each(keys, (key) => {
      const node = _.find(this.nodes.nodes(), _node => _node.__data__ === key)
      if (node) node.classList.add('selected')
    })
  }

  _onDeselect (keys) {
    _.each(keys, (key) => {
      const node = _.find(this.nodes.nodes(), _node => _node.__data__ === key)
      if (node) node.classList.remove('selected')
    })
  }
}
new App() // eslint-disable-line
