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

    // 兜底隐藏已知 MutationObserver TypeError，避免刷新时污染控制台
    var suppress = function (message) {
      return (
        typeof message === 'string' &&
        message.indexOf("Failed to execute 'observe' on 'MutationObserver'") !== -1
      )
    }

    window.addEventListener(
      'error',
      function (e) {
        if (suppress(e.message)) {
          e.preventDefault()
          return true
        }
      },
      { capture: true }
    )

    window.addEventListener(
      'unhandledrejection',
      function (e) {
        var msg = e?.reason?.message || ''
        if (suppress(msg)) {
          e.preventDefault()
          return true
        }
      },
      { capture: true }
    )
  } catch (e) {
    // swallow any unexpected errors to avoid breaking bootstrap
  }
})()

