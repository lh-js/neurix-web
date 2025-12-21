/**
 * MutationObserver Polyfill
 * 修复 Radix UI Portal 组件在 document.body 未准备好时调用 observe 的错误
 * 
 * 这个文件必须在任何使用 Radix UI 的代码之前导入
 */

if (typeof window !== 'undefined' && window.MutationObserver) {
  // Debug hook：确认守卫已注入，避免线上误以为未生效
  if (!(window as any).__MO_GUARD_LOGGED__) {
    ;(window as any).__MO_GUARD_LOGGED__ = true
    // 仅在控制台低噪声输出一次
    try {
      console.debug?.('[MO guard] installed', new Date().toISOString())
    } catch (_) {
      // ignore
    }
  }

  const OriginalMutationObserver = window.MutationObserver
  const originalObserve = OriginalMutationObserver.prototype.observe

  const ensureBodyReady = (self: MutationObserver, options?: MutationObserverInit) => {
    const tryAttach = () => {
      if (document && document.body) {
        try {
          originalObserve.call(self, document.body, options)
        } catch (_) {
          // swallow
        }
        return true
      }
      return false
    }

    if (tryAttach()) return

    const interval = setInterval(() => {
      if (tryAttach()) clearInterval(interval)
    }, 10)

    setTimeout(() => {
      clearInterval(interval)
      tryAttach()
    }, 1000)
  }

  // 重写 observe 方法
  OriginalMutationObserver.prototype.observe = function (
    target: Node | null,
    options?: MutationObserverInit
  ) {
    const isNode = target && typeof target === 'object' && typeof (target as any).nodeType === 'number'
    const isBodyTarget =
      target === document.body || (target && (target as any).nodeName === 'BODY')

    if (!isNode) {
      if (isBodyTarget) {
        ensureBodyReady(this, options)
      }
      return
    }

    try {
      originalObserve.call(this, target as Node, options)
    } catch (err: any) {
      // 某些第三方会传入非 Node 导致 TypeError，这里安全吞掉
      if (err && err.name === 'TypeError') return
      throw err
    }
  }
}

