;(function () {
  // Minimal, CSP-friendly MutationObserver guard for early load (runs from /public)
  if (typeof window === 'undefined' || !window.MutationObserver) return

  try {
    if (!window.__MO_GUARD_LOGGED__) {
      window.__MO_GUARD_LOGGED__ = true
      console.debug?.('[MO guard] installed (public script)', new Date().toISOString())
    }

    var OriginalMutationObserver = window.MutationObserver
    var originalObserve = OriginalMutationObserver.prototype.observe

    var ensureBodyReady = function (self, options) {
      var tryAttach = function () {
        if (document && document.body) {
          try {
            originalObserve.call(self, document.body, options)
          } catch (_) {}
          return true
        }
        return false
      }

      if (tryAttach()) return

      var interval = setInterval(function () {
        if (tryAttach()) clearInterval(interval)
      }, 10)

      setTimeout(function () {
        clearInterval(interval)
        tryAttach()
      }, 1000)
    }

    OriginalMutationObserver.prototype.observe = function (target, options) {
      var isNode = target && typeof target === 'object' && typeof target.nodeType === 'number'
      var isBodyTarget = target === document.body || (target && target.nodeName === 'BODY')

      if (!isNode) {
        if (isBodyTarget) {
          ensureBodyReady(this, options)
        }
        return
      }

      try {
        return originalObserve.call(this, target, options)
      } catch (err) {
        if (err && err.name === 'TypeError') return
        throw err
      }
    }
  } catch (e) {
    // swallow any unexpected errors to avoid breaking bootstrap
  }
})()

