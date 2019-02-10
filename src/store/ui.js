const state = {
  appName: '',
  appVersion: '',
};

const mutations = {
  setAppName(state, name) {
    state.appName = name;
  },
  setAppVersion(state, version) {
    state.appVersion = version;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
