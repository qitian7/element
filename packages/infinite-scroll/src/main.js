import throttle from 'throttle-debounce/debounce';
import {
  isHtmlElement,
  isFunction,
  isUndefined,
  isDefined
} from 'element-ui/src/utils/types';
import {
  getScrollContainer
} from 'element-ui/src/utils/dom';

const getStyleComputedProperty = (element, property) => {
  if (element === window) {
    element = document.documentElement;
  }

  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  const css = window.getComputedStyle(element, null);
  return property ? css[property] : css;
};

const entries = (obj) => {
  return Object.keys(obj || {})
    .map(key => ([key, obj[key]]));
};

const getPositionSize = (el, prop) => {
  return el === window || el === document
    ? document.documentElement[prop]
    : el[prop];
};

const getOffsetHeight = el => {
  return getPositionSize(el, 'offsetHeight');
};

const getClientHeight = el => {
  return getPositionSize(el, 'clientHeight');
};

const scope = 'ElInfiniteScroll';
const attributes = {
  delay: {
    type: Number,
    default: 200
  },
  distance: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  immediate: {
    type: Boolean,
    default: true
  }
};

const getScrollOptions = (el, vm) => {
  if (!isHtmlElement(el)) return {};

  return entries(attributes).reduce((map, [key, option]) => {
    const { type, default: defaultValue } = option;
    let value = el.getAttribute(`infinite-scroll-${key}`);
    value = isUndefined(vm[value]) ? value : vm[value];
    switch (type) {
      case Number:
        value = Number(value);
        value = Number.isNaN(value) ? defaultValue : value;
        break;
      case Boolean:
        value = isDefined(value) ? value === 'false' ? false : Boolean(value) : defaultValue;
        break;
      default:
        value = type(value);
    }
    map[key] = value;
    return map;
  }, {});
};

const getElementTop = el => el.getBoundingClientRect().top;

// 如果触底了, 才执行cb()(v-infinite-scroll绑定的函数)
const handleScroll = function(cb) {
  const { el, vm, container, observer } = this[scope];
  const { distance, disabled } = getScrollOptions(el, vm);

  if (disabled) return;

  const containerInfo = container.getBoundingClientRect();
  if (!containerInfo.width && !containerInfo.height) return;

  let shouldTrigger = false;

  if (container === el) {
    // be aware of difference between clientHeight & offsetHeight & window.getComputedStyle().height
    const scrollBottom = container.scrollTop + getClientHeight(container);
    shouldTrigger = container.scrollHeight - scrollBottom <= distance;
  } else {
    const heightBelowTop = getOffsetHeight(el) + getElementTop(el) - getElementTop(container);
    const offsetHeight = getOffsetHeight(container);
    const borderBottom = Number.parseFloat(getStyleComputedProperty(container, 'borderBottomWidth'));
    shouldTrigger = heightBelowTop - offsetHeight + borderBottom <= distance;
  }

  if (shouldTrigger && isFunction(cb)) {
    cb.call(vm);
  } else if (observer) {
    observer.disconnect();
    this[scope].observer = null;
  }

};


/** 指令思路
 *    1. 判断是否有滚动条, 在监听滚动事件
 *    2. 滚动条滚到底, 则执行 v-infinite-scroll= 对应的事件 (其他的更新都是利用vue自己的响应式系统)
 */

export default {
  name: 'InfiniteScroll',
  inserted(el, binding, vnode) {
    const cb = binding.value;

    const vm = vnode.context;
    // only include vertical scroll
    // (一直往父级找, 直到)找到有滚动条的一层     overflow-y 或 overflow   auto
    const container = getScrollContainer(el, true);
    // 拿到props传进来的参数
    const { delay, immediate } = getScrollOptions(el, vm);
    // 如果触底了, 才执行cb()(v-infinite-scroll绑定的函数)
    const onScroll = throttle(delay, handleScroll.bind(el, cb));

    el[scope] = { el, vm, container, onScroll };

    if (container) { // 必须存在滚动条
      container.addEventListener('scroll', onScroll);

      // 默认立即执行加载方法，以防初始状态下内容无法撑满容器。
      if (immediate) {
        const observer = el[scope].observer = new MutationObserver(onScroll);
        observer.observe(container, { childList: true, subtree: true });
        onScroll();
      }
    }
  },
  unbind(el) {
    const { container, onScroll } = el[scope];
    if (container) {
      container.removeEventListener('scroll', onScroll);
    }
  }
};

