import store from '@/store';

const clientInit = {
  install(Vue) {
    Vue.prototype.$apiPrefix = process.env.VUE_APP_API_PREFIX;
    Vue.prototype.$baseUrl = process.env.BASE_URL;
  },
};

export default clientInit;
