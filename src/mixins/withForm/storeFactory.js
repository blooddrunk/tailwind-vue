import clone from 'lodash/clone';

export default (initialData = {}, { idKey = 'id' } = {}) => {
  const state = {
    data: clone(initialData),

    // defaultData stores data which serves to reset form
    defaultData: clone(initialData),

    // initialData is form initial data which serves to clear form
    initialData,
    saving: false,
    loading: false,
    fetchError: null,
    saveError: null,
    validationError: null,
  };

  const getters = {
    formId: state => state.data && state.data[idKey],

    formData: state => state.data,
  };

  const mutations = {
    clearFormError: state => {
      state.fetchError = null;
      state.saveError = null;
      state.validationError = null;
    },

    clearForm: state => {
      state.data = { ...state.initialData };
    },

    resetForm: state => {
      state.data = { ...state.defaultData };
    },

    updateForm: (state, payload) => {
      state.data = {
        ...state.data,
        ...payload,
      };
    },

    updateFormAndDefault: (state, payload) => {
      state.data = {
        ...state.data,
        ...payload,
      };

      state.defaultData = clone(state.data);
    },

    fetchFormRequest: state => {
      state.fetchError = null;
      state.loading = true;
    },

    fetchFormSuccess: (state, payload) => {
      state.data = {
        ...state.defaulData,
        ...payload,
      };
      state.defaultData = clone(state.data);
      state.loading = false;
    },

    fetchFormFailure: (state, error) => {
      state.fetchError = error;
      state.loading = false;
    },

    saveFormRequest: state => {
      state.saveError = null;
      state.saving = true;
    },

    saveFormSuccess: state => {
      state.saving = false;
      state.defaultData = clone(state.data);
    },

    saveFormFailure: (state, error) => {
      state.saveError = error;
      state.saving = false;
    },
  };

  const actions = {
    clearForm: ({ commit }) => {
      commit('clearFormError');
      commit('clearForm');
    },

    resetForm: ({ commit }) => {
      commit('clearFormError');
      commit('resetForm');
    },

    async fetchForm({ commit }, { defaultData = {}, ...config }) {
      commit('fetchFormRequest');

      try {
        const response = await this.$axios(config);

        commit('fetchFormSuccess', {
          ...defaultData,
          ...response.data,
        });

        return response;
      } catch (error) {
        commit('fetchFormFailure', error);
        return { error };
      }
    },

    async saveForm({ commit }, config) {
      commit('saveFormRequest');

      try {
        const response = await this.$axios(config);

        commit('saveFormSuccess');

        return response;
      } catch (error) {
        commit('saveFormFailure');
        return { error };
      }
    },
  };

  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
  };
};
