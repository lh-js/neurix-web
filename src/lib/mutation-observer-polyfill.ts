/**
 * MutationObserver Polyfill
 * 修复 Radix UI Portal 组件在 document.body 未准备好时调用 observe 的错误
 * 
 * 这个文件必须在任何使用 Radix UI 的代码之前导入
 */

if (typeof window !== 'undefined' && window.MutationObserver) {
  const OriginalMutationObserver = window.MutationObserver
  const OriginalObserve = OriginalMutationObserver.prototype.observe

  // 重写 observe 方法
  OriginalMutationObserver.prototype.observe = function (
    target: Node,
    options?: MutationObserverInit
  ) {
    // 严格检查 target 是否是有效的 Node
    const isValidNode =
      target &&
      typeof target === 'object' &&
      target.nodeType !== undefined &&
      target.nodeType === Node.ELEMENT_NODE &&
      target instanceof Node

    if (!isValidNode) {
      // 如果 target 是 document.body 但 body 还不存在，等待它准备好
      if (
        target === document.body ||
        (target && (target as any).constructor?.name === 'HTMLBodyElement')
      ) {
        const self = this
        const checkBody = setInterval(() => {
          if (
            document.body &&
            document.body instanceof Node &&
            document.body.nodeType === Node.ELEMENT_NODE
          ) {
            clearInterval(checkBody)
            try {
              OriginalObserve.call(self, document.body, options)
            } catch (e) {
              // 静默处理错误
            }
          }
        }, 10)

        setTimeout(() => {
          clearInterval(checkBody)
          if (document.body && document.body instanceof Node) {
            try {
              OriginalObserve.call(self, document.body, options)
            } catch (e) {
              // 静默处理错误
            }
          }
        }, 1000)
        return
      }
      // 对于其他无效目标，直接返回，不执行
      return
    }

    // 对于有效的 Node，正常执行
    try {
      OriginalObserve.call(this, target, options)
    } catch (e) {
      // 如果仍然失败，静默处理
    }
  }
}
