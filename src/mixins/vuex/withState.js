import { mapState } from 'vuex';
import getIn from 'lodash/get';
import camelCase from 'lodash/camelCase';

/**
 * @param storeConfig array of namespaces of list stores
 */
export default (storeConfig = {}) => ({
  beforeCreate() {
    const storeData = {};

    this.$_withVuexState_localModules = [];

    Object.keys(storeConfig).forEach(namespace => {
      let computedKey = '';
      const moduleRegistry = storeConfig[namespace];

      // dynamic module, the component is responsible to register it in the callback
      // and optionally return the state key used in computed(default to camel cased namespace)
      if (typeof moduleRegistry === 'function') {
        computedKey = moduleRegistry.call(this, namespace.split('/'));
        this.$_withVuexState_localModules.push(namespace);
      } else if (typeof moduleRegistry === 'string') {
        // static module, corresponding module should've been defined in '@/store'
        computedKey = moduleRegistry;
      }

      if (!computedKey) {
        computedKey = camelCase(namespace);
      }

      storeData[computedKey] = state => {
        return getIn(state, namespace.split('/'));
      };
    });

    this.$options.computed = {
      ...this.$options.computed,
      ...mapState(storeData),
    };
  },

  beforeDestroy() {
    if (this.$_withVuexState_localModules.length) {
      this.$_withVuexState_localModules.forEach(namespace => {
        this.$store.unregisterModule(namespace.split('/'));
      });
    }
  },
});
