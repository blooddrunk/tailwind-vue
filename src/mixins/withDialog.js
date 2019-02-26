export default (prop = 'value', event = 'input') => ({
  model: { prop, event },

  props: {
    [prop]: { required: false },
  },

  data() {
    return {
      visible: !!this[prop],
    };
  },

  watch: {
    [prop](val) {
      this.visible = !!val;
    },
    visible(val) {
      !!val !== this[prop] && this.$emit(event, val);
    },
  },
});
