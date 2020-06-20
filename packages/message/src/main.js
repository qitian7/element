import Vue from 'vue';
import Main from './main.vue';
import { PopupManager } from 'element-ui/src/utils/popup';
import { isVNode } from 'element-ui/src/utils/vdom';
let MessageConstructor = Vue.extend(Main);

let instance;
let instances = [];
let seed = 1;

/**
 *  options {
 *    message: '',
 *    onClose: function, // 关闭时的回调函数, 参数为被关闭的 message 实例
 *  }
 */
const Message = function(options) {
  if (Vue.prototype.$isServer) return;
  options = options || {};
  if (typeof options === 'string') {
    options = {
      message: options
    };
  }
  let userOnClose = options.onClose;
  let id = 'message_' + seed++;

  options.onClose = function() {
    Message.close(id, userOnClose); //
  };
  instance = new MessageConstructor({
    data: options
  });

  /**  el  只在用 new 创建实例时生效。 vm.$el 访问。
   *    如果在实例化时存在这个选项，实例将立即进入编译过程，
   *    否则，需要显式调用 vm.$mount() 手动开启编译。
   */
  instance.id = id;

  // 支持vnode
  //  this.$message({
  //    message: h('p', null, [
  //      h('span', null, '内容可以是 '),
  //      h('i', { style: 'color: teal' }, 'VNode')
  //    ])
  //  });
  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message];
    instance.message = null;
  }
  instance.$mount(); // 进入编译过程
  document.body.appendChild(instance.$el);

  let verticalOffset = options.offset || 20;
  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 16;
  });
  instance.verticalOffset = verticalOffset;
  instance.visible = true;
  instance.$el.style.zIndex = PopupManager.nextZIndex();
  instances.push(instance);
  return instance;
};

['success', 'warning', 'info', 'error'].forEach(type => {
  Message[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options
      };
    }
    options.type = type;
    return Message(options);
  };
});

// 关掉的 办法:  用top控制
Message.close = function(id, userOnClose) {
  let len = instances.length;
  let index = -1;
  let removedHeight;
  for (let i = 0; i < len; i++) {
    if (id === instances[i].id) {
      removedHeight = instances[i].$el.offsetHeight;
      index = i;
      if (typeof userOnClose === 'function') {
        userOnClose(instances[i]);
      }
      instances.splice(i, 1);
      break;
    }
  }
  if (len <= 1 || index === -1 || index > instances.length - 1) return;
  // 当连续点击, 是弹出msg超过 1个后, 这里是控制下面所有的都往上移动(控制动画)
  for (let i = index; i < len - 1 ; i++) {
    let dom = instances[i].$el;
    dom.style['top'] =
      parseInt(dom.style['top'], 10) - removedHeight - 16 + 'px';
  }
};

Message.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close();
  }
};

export default Message;
