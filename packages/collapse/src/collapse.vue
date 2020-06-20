<template>
  <div class="el-collapse" role="tablist" aria-multiselectable="true">
    <slot></slot>
  </div>
</template>
<script>
  export default {
    name: 'ElCollapse',

    componentName: 'ElCollapse',

    props: {
      accordion: Boolean,
      value: {
        type: [Array, String, Number],
        default() {
          return [];
        }
      }
    },

    data() {
      return {
        activeNames: [].concat(this.value)
      };
    },

    provide() {
      return {
        collapse: this
      };
    },

    watch: {
      value(value) {
        this.activeNames = [].concat(value);
      }
    },

    created() {
      //  this.$on 和 this.$emit  是配套的
      //    this.$on : 监听当前实例上的自定义事件。
      //    事件可以由vm.$emit触发。回调函数会接收所有传入事件触发函数的额外参数。
      //      this.dispatch('ElCollapse', 'item-click', this); 利用的就是这个原理
      this.$on('item-click', this.handleItemClick);
    },

    methods: {
      setActiveNames(activeNames) {
        activeNames = [].concat(activeNames);
        let value = this.accordion ? activeNames[0] : activeNames;
        this.activeNames = activeNames;
        this.$emit('input', value);
        this.$emit('change', value);
      },
      handleItemClick(item) {
        if (this.accordion) {
          this.setActiveNames(
            (this.activeNames[0] || this.activeNames[0] === 0) &&
            this.activeNames[0] === item.name
              ? '' : item.name
          );
        } else {
          let activeNames = this.activeNames.slice(0);
          let index = activeNames.indexOf(item.name);

          if (index > -1) {
            activeNames.splice(index, 1);
          } else {
            activeNames.push(item.name);
          }
          this.setActiveNames(activeNames);
        }
      }
    }
  };
</script>
