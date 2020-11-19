export function debounce (func, wait, immediate) {
  var timeout, result

  var debounced = function () {
    var context = this
    var args = arguments
    if (timeout) clearTimeout(timeout)

    var later = function () {
      timeout = null
      if (!immediate) result = func.apply(context, args)
    }

    var callNow = immediate && !timeout
    timeout = setTimeout(later, wait)
    if (callNow) result = func.apply(this, args)

    return result
  }
  debounced.cancel = function () {
    clearTimeout(timeout)
    timeout = null
  }
  return debounced
}
