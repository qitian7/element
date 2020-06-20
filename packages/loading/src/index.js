import Vue from 'vue';
import loadingVue from './loading.vue';
import { addClass, removeClass, getStyle } from 'element-ui/src/utils/dom';
import { PopupManager } from 'element-ui/src/utils/popup';
import afterLeave from 'element-ui/src/utils/after-leave';
import merge from 'element-ui/src/utils/merge';


/**
 * 1. 给Vue.extend(loadingVue) 遮罩层, 增加一些变量和方法(close)
 * 2. 给父和loading层都加上样式
 * 3. 返回 遮罩层 的vue实例!
 */

const LoadingConstructor = Vue.extend(loadingVue);

let fullscreenLoading;

LoadingConstructor.prototype.originalPosition = '';
LoadingConstructor.prototype.originalOverflow = '';

// 控制关掉loading: 1.removeClass  2.稍微延迟关闭
LoadingConstructor.prototype.close = function() {
  if (this.fullscreen) {
    fullscreenLoading = undefined;
  }
  // (此函数目的是 兼容, 确保在所有浏览器中都调用了after-leave。) 为vue实例绑定离开后事件。
  afterLeave(this, _ => {
    const target = this.fullscreen || this.body
      ? document.body
      : this.target;
    removeClass(target, 'el-loading-parent--relative');
    removeClass(target, 'el-loading-parent--hidden');
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
    this.$destroy();
  }, 300);
  this.visible = false;
};

// 给实例 instance 加上 样式(初始化样式 / 根据 对应的元素),
const addStyle = (options, parent, instance) => {
  let maskStyle = {};
  if (options.fullscreen) {
    instance.originalPosition = getStyle(document.body, 'position');
    instance.originalOverflow = getStyle(document.body, 'overflow');
    maskStyle.zIndex = PopupManager.nextZIndex();
  } else if (options.body) {
    instance.originalPosition = getStyle(document.body, 'position');
    ['top', 'left'].forEach(property => {
      let scroll = property === 'top' ? 'scrollTop' : 'scrollLeft';
      maskStyle[property] = options.target.getBoundingClientRect()[property] +
        document.body[scroll] +
        document.documentElement[scroll] +
        'px';
    });
    ['height', 'width'].forEach(property => {
      maskStyle[property] = options.target.getBoundingClientRect()[property] + 'px';
    });
  } else {
    instance.originalPosition = getStyle(parent, 'position');
  }
  Object.keys(maskStyle).forEach(property => {
    instance.$el.style[property] = maskStyle[property];
  });
};

//         const loading = this.$loading({
//           lock: true,
//           text: 'Loading',
//           spinner: 'el-icon-loading',
//           background: 'rgba(0, 0, 0, 0.7)'
//         });
//         setTimeout(() => {
//           loading.close();
//         }, 2000);
const defaults = {
  text: null,
  fullscreen: true,
  body: false,
  lock: false,
  customClass: ''
};
const Loading = (options = {}) => {
  if (Vue.prototype.$isServer) return;
  options = merge({}, defaults, options);
  if (typeof options.target === 'string') {
    options.target = document.querySelector(options.target);
  }
  options.target = options.target || document.body;
  if (options.target !== document.body) {
    options.fullscreen = false;
  } else {
    options.body = true;
  }
  if (options.fullscreen && fullscreenLoading) {
    return fullscreenLoading;
  }

  let parent = options.body ? document.body : options.target;

  let instance = new LoadingConstructor({
    el: document.createElement('div'),
    data: options
  });

  // 给父和loading层都加上样式
  addStyle(options, parent, instance);
  if (instance.originalPosition !== 'absolute' && instance.originalPosition !== 'fixed') {
    addClass(parent, 'el-loading-parent--relative');
  }
  if (options.fullscreen && options.lock) {
    addClass(parent, 'el-loading-parent--hidden');
  }
  // 给父和loading层都加上样式
  parent.appendChild(instance.$el);

  Vue.nextTick(() => {
    instance.visible = true;
  });
  if (options.fullscreen) {
    fullscreenLoading = instance;
  }

  // 返回 遮罩层 的vue实例!
  return instance;
};

export default Loading;
