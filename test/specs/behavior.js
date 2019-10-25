import Behavior from '../../src/behavior'
import { off } from '../../src/events'

describe('Behavior', () => {
  let behavior
  let container
  beforeEach(() => {
    container = document.querySelector('.container')
    behavior = new Behavior({ container })
  })
  afterEach(() => {
    off(container, 'custom.Behavior')
  })
  describe('CRUD', () => {
    it('should handle event when enabled', (done) => {
      const event = new Event('custom', { bubbles: true })
      behavior.test = 1
      behavior.handler = function (e) {
        expect(this.test).toEqual(1)
        done()
      }
      behavior.events = {
        'custom .node': 'handler',
      }
      behavior.enable()
      container.querySelector('.node').dispatchEvent(event)
    })
  })
})
