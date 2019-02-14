import store from '@/store';

const clientInit = {
  async install(Vue) {
    Vue.prototype.$apiPrefix = process.env.VUE_APP_API_PREFIX;
    Vue.prototype.$baseUrl = process.env.BASE_URL;

    await store.dispatch('clientInit');
  },
};

export default clientInit;
