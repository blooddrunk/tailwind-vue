import Vuex from 'vuex';

import auth from './auth';
import ui from './ui';

export default new Vuex.Store({
  modules: {
    auth,
    ui,
  },
  state: {},
  mutations: {},
  actions: {
    async clientInit() {},
  },
});
