export default {
  data() {
    return {
      hoverOption: -1
    };
  },

  computed: {
    optionsAllDisabled() {
      return this.options.filter(option => option.visible).every(option => option.disabled);
    }
  },

  watch: {
    hoverIndex(val) {
      if (typeof val === 'number' && val > -1) {
        this.hoverOption = this.options[val] || {};
      }
      this.options.forEach(option => {
        option.hover = this.hoverOption === option;
      });
    }
  },

  methods: {
    // 键盘按下: option的active往下走(跳过disabled 或是 组名 ), 并且滚动条也移动
    navigateOptions(direction) {
      if (!this.visible) {
        this.visible = true;
        return;
      }
      if (this.options.length === 0 || this.filteredOptionsCount === 0) return;
      if (!this.optionsAllDisabled) {
        if (direction === 'next') {
          this.hoverIndex++;
          if (this.hoverIndex === this.options.length) {
            this.hoverIndex = 0;
          }
        } else if (direction === 'prev') {
          this.hoverIndex--;
          if (this.hoverIndex < 0) {
            this.hoverIndex = this.options.length - 1;
          }
        }
        const option = this.options[this.hoverIndex];
        // 如果某个 option 是disabled或是 组名 则跳过他们
        if (option.disabled === true ||
          option.groupDisabled === true ||
          !option.visible) {
          this.navigateOptions(direction);
        }
        this.$nextTick(() => this.scrollToOption(this.hoverOption));
      }
    }
  }
};
