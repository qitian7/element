/** 类似 Object.assign()
 *   merge({ visibleArrow: true }, {
 *     a: 1,
 *     b: 2,
 *     ..
 *   });
 *
 *   返回 {
 *     visibleArrow: true,
 *     a: 1,
 *     b: 2,
 *     ..
 *   }
 */
export default function(target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i] || {};
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }

  return target;
};
