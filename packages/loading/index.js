import directive from './src/directive';
import service from './src/index';

export default {
  directive,
  service,

  /** 所有的 package里的install, 都可以注释掉, 不影响本项目
   *    留下来的原因:  可以按需引入, 比如:  import { Loading } from 'element-ui';
   *    这样单独引入的, 需要重新 install
   */
  install(Vue) {
    Vue.use(directive); // v-loading
    Vue.prototype.$loading = service; // this.$loading
  }
};
