import { hasOwn } from 'element-ui/src/utils/util';

// 判断是不是 vue的Vnode
export function isVNode(node) {
  return node !== null && typeof node === 'object' && hasOwn(node, 'componentOptions');
};
