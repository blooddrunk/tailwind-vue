import merge from 'lodash/merge';
import mapKeys from 'lodash/mapKeys';

import { takeLatest } from '@/utils/http';

export default ({
  pagination: { page = 1, rowsPerPage = 25 } = {},
  filter = {},
  rowsPerPageItems = [10, 25, 50, 100],
  paginationMap = {
    page: 'pageNum',
    rowsPerPage: 'perPageNum',
  },
  defaultDataTransformer = ({ ret: { data = {} } = {} } = {}) => ({
    items: data.records,
    total: data.page.total,
  }),
} = {}) => {
  const state = {
    error: null,
    filter,
    items: [],
    loading: false,
    pagination: {
      page,
      rowsPerPage,
    },
    rowsPerPageItems,
    total: 0,
  };

  const getters = {
    presetQuery: state => ({
      ...state.filter,
      ...mapKeys(state.pagination, (value, key) => paginationMap[key]),
    }),
  };

  const mutations = {
    setItems(state, payload = []) {
      state.items = payload;
    },

    fetchItemsRequest(state) {
      state.error = null;
      state.loading = true;
    },

    fetchItemsSuccess(state, { items = [], total }) {
      state.loading = false;
      state.items = items;
      if (typeof total === 'string') {
        state.total = Number.parseInt(total, 10);
      } else {
        state.total = total;
      }
    },

    fetchItemsFailure(state, error) {
      state.error = error;
      state.loading = false;
    },
  };

  let callFetchItems;

  const actions = {
    async fetchItems({ commit }, config) {
      commit('fetchItemsRequest');

      if (!callFetchItems) {
        callFetchItems = takeLatest(this.$axios);
      }

      config.method = config.method || 'get';

      let payload = this.presetQuery;
      if (typeof config.parseQuery === 'function') {
        payload = config.parseQuery(payload);
        delete config.parseQuery;
      }

      if (config.method.toLowerCase() === 'get') {
        payload = { params: payload };
      } else {
        payload = { data: payload };
      }

      config = merge(
        {
          transformData: defaultDataTransformer,
          ...payload,
        },
        config
      );

      try {
        const { data } = await callFetchItems(config);

        let items, total;
        if (Array.isArray(data)) {
          items = data;
          total = items.length;
        } else {
          items = data.items;
          total = data.total;
        }

        if (typeof items === 'undefined' || typeof total === 'undefined') {
          const message = `[loadlist] expect response to be an array or object with both 'items' and 'total' key`;
          console.error(message);

          const error = new Error(message);
          commit('fetchItemsFailure', error);

          return { error };
        }

        commit('fetchItemsSuccess', {
          items,
          total,
        });

        return {
          items,
          total,
        };
      } catch (error) {
        commit('fetchItemsFailure', error);

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
