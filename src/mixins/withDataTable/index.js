import merge from 'lodash/merge';
import mapKeys from 'lodash/mapKeys';
import pick from 'lodash/pick';

import { takeLatest } from '@/utils/http';

export default ({
  name = 'dataTable',
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
  let callFetchDataTable;

  return {
    data: () => ({
      [name]: {
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
      },
    }),

    computed: {
      presetQuery() {
        const paginationForQuery = pick(this[name].pagination, Object.keys(paginationMap));
        return {
          ...this[name].filter,
          ...mapKeys(paginationForQuery, (value, key) => paginationMap[key]),
        };
      },
    },

    methods: {
      async $_fetchItems(config) {
        this[name].error = null;
        this[name].loading = true;

        if (!callFetchDataTable) {
          callFetchDataTable = takeLatest(this.$axios);
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
          const { data } = await callFetchDataTable(config);

          let items, total;
          if (Array.isArray(data)) {
            items = data;
            total = items.length;
          } else {
            items = data.items;
            total = data.total;
          }

          if (typeof items === 'undefined') {
            const message = `[${name}:withDataTable] [$_fetchDataTable] expect response to be an array or object with both 'items' and 'total' key`;
            console.error(message);

            throw new Error(message);
          }

          this[name].items = items;
          this[name].total = total;

          // TODO what to return?
          return {
            items,
            total,
          };
        } catch (error) {
          this.$showSnackbar.error(error.message);
          this[name].error = error;
        } finally {
          this[name].loading = false;
        }
      },
    },
  };
};
