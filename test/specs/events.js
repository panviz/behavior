import { on, off } from '../../src/events'

describe('EventRegistry', () => {
  let container
  beforeEach(() => {
    container = document.querySelector('.container')
  })
  afterEach(() => {
    off(container, 'custom.namespace')
  })
  describe('functions', () => {
    it('should trigger delegated event handler', (done) => {
      const obj = {
        test: 1,
        handler (e) {
          expect(this.test).toEqual(1)
          done()
        },
      }
      const event = new Event('custom', { bubbles: true })
      on(container, 'custom.namespace', obj.handler.bind(obj), '.node')
      container.querySelector('.node').dispatchEvent(event)
    })
    it('should unsubscribe all events by namespace', (done) => {
      const obj = {
        test: 1,
        handler (e) {
          throw (new Error)
        },
        handler2 (e) {
          throw (new Error)
        },
      }
      const event = new Event('custom', { bubbles: true })
      on(container, 'custom.namespace', obj.handler.bind(obj))
      on(container, 'custom.namespace', obj.handler2.bind(obj))
      on(container, 'custom1.namespace', obj.handler.bind(obj))
      off(container, '.namespace')
      container.dispatchEvent(event)
      expect(container.namespaces.namespace.custom.length).toEqual(0)
      done()
    })
  })
})
