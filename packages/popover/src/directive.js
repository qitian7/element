
// v-popover:popover
//    1. 用refs.popover 拿到对应的 对应的vdom
//    2. 用的vdom的$refs.reference保存 v-popover绑定的vnode(比如button)

const getReference = (el, binding, vnode) => {
  // binding.arg 是 v-xx: 绑定的 字符串
  const _ref = binding.expression ? binding.value : binding.arg;
  const popper = vnode.context.$refs[_ref]; // 用ref拿到dom
  if (popper) {
    if (Array.isArray(popper)) {
      popper[0].$refs.reference = el;
    } else {
      popper.$refs.reference = el;
    }
  }
};

export default {
  bind(el, binding, vnode) {
    getReference(el, binding, vnode);
  },
  inserted(el, binding, vnode) {
    getReference(el, binding, vnode);
  }
};
