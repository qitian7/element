import normalizeWheel from 'normalize-wheel'; // 跨浏览器 滚轮兼容

const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

const mousewheel = function(element, callback) {
  if (element && element.addEventListener) {
    element.addEventListener(isFirefox ? 'DOMMouseScroll' : 'mousewheel', function(event) {
      const normalized = normalizeWheel(event);
      callback && callback.apply(this, [event, normalized]);
    });
  }
};

// 跨浏览器 滚轮兼容
export default {
  bind(el, binding) {
    mousewheel(el, binding.value);
  }
};
