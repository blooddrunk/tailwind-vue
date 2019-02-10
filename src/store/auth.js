const intialState = {
  user: {},
  hasForcedOut: false,
  loginError: null,
  loading: false,
};

const state = {
  ...intialState,
};

const getters = {
  user: ({ user = {} }) => user,
  userName: (state, { user }) => user.userName,
  isLoggedIn: (state, { userName }) => !!userName,
};

const mutations = {
  forceLogout(state, payload) {
    state.hasForcedOut = !!payload;
  },

  loginRequest(state) {
    state.loading = true;
    state.loginError = null;
  },

  loginSuccess(state, payload) {
    state.loading = false;
    state.user = {
      ...state.user,
      ...payload,
    };
  },

  logout(state) {
    state.user = { ...intialState };
  },

  loginFailure(state, error) {
    state.loading = false;
    state.loginError = error;
  },

  updateUser(state, payload) {
    if (state.user) {
      state.user = {
        ...state.user,
        ...payload,
      };
    }
  },

  clearError(state) {
    state.loginError = null;
  },
};

const actions = {
  async login({ commit }) {
    commit('loginRequest');

    try {
      const user = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            userName: 'Joe',
          });
        }, 2000);
      });

      commit('loginSuccess', {
        ...user,
      });
    } catch (error) {
      commit('loginFailure', error);
      throw error;
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
