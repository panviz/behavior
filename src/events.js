export function on (el, eventName, handler, selector, opts) {
  const [event, namespace] = eventName.split('.')
  // save the namespaces on the DOM element itself
  if (!el.namespaces) el.namespaces = {}
  if (!el.namespaces[namespace]) el.namespaces[namespace] = {}

  const delegator = (e) => {
    let currentTarget
    if (selector) {
      currentTarget = e.target.closest(selector)
      if (currentTarget) handler(e, currentTarget)
    } else if (e.target === el) handler(e, el)
  }

  el.namespaces[namespace][event] = el.namespaces[namespace][event] || []
  el.namespaces[namespace][event].push(delegator)
  const options = opts || false

  el.addEventListener(event, delegator, options)
}

export function off (el, eventName, handler) {
  const [event, namespace] = eventName.split('.')
  if (event) {
    if (handler) {
      el.removeEventListener(event, handler)
      el.namespaces[namespace][event] = _.without(el.namespaces[namespace][event], handler)
    } else {
      _.each(el.namespaces[namespace][event], (_handler) => {
        off(el, `${event}.${namespace}`, _handler)
      })
    }
  } else if (el.namespaces) {
    _.each(el.namespaces[namespace], (events, _event) => {
      off(el, `${_event}.${namespace}`)
    })
  }
}
