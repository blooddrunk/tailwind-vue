import { takeLatest } from '@/utils/http';

export default ({
  name = 'dataTable',
  pagination: { page = 1, rowsPerPage = 25 } = {},
  search = {},
} = {}) => {
  let callFetchDataTable;

  return {
    data: () => ({
      [name]: {
        appliedFilter: {},
        error: null,
        items: [],
        loading: false,
        pagination: {
          page,
          rowsPerPage,
        },
        search,
        total: 0,
      },
    }),

    methods: {
      async $_buildQuery() {
        return {
          ...this[name].search,
          ...this[name].pagination,
        };
      },

      async $_fetchDataTable(config) {
        if (!callFetchDataTable) {
          callFetchDataTable = takeLatest(this.$axios);
        }

        this[name].error = null;
        this[name].loading = true;

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
          // TODO error handling
          this[name].error = error;
        } finally {
          this[name].loading = false;
        }
      },
    },
  };
};
