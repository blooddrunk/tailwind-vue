import { isCancel } from 'axios';

import { takeLatest } from '@/utils/http';

const normalizeFields = (fields, { dataKey, stateKey }) =>
  fields.reduce((acc, cur) => {
    if (!Array.isArray(cur)) {
      cur = [cur];
    }
    const [key, defaultDataValue = []] = cur;

    acc[key] = {
      [dataKey]: defaultDataValue,
      [stateKey]: false,
    };
    return acc;
  }, {});

export default (fields = [], config = {}) => {
  const { dataKey = 'data', stateKey = 'loading', storeKey = 'asyncData' } = config;

  if (!Array.isArray(fields)) {
    console.error('[withAsyncData] ', 'field config should be an array');
    return;
  }

  const asyncRequests = new Map();

  return {
    data: () => ({
      [storeKey]: normalizeFields(fields, {
        dataKey,
        stateKey,
      }),
    }),

    methods: {
      async $_fetchAsyncData(field, { alertError = true, ...config } = {}, label = '') {
        if (!this[storeKey].hasOwnProperty(field)) {
          console.error('[withAsyncData] ', field, 'not defined in asyncData');
          return;
        }

        if (!asyncRequests.has(field)) {
          asyncRequests.set(field, takeLatest(this.$axios));
        }

        this[storeKey][field][stateKey] = true;
        try {
          const { data } = await asyncRequests.get(field)(config);
          this[storeKey][field][dataKey] = data;

          return data;
        } catch (error) {
          this[storeKey][field][dataKey] = [];

          if (!isCancel(error)) {
            if (alertError) {
              const message = `${label}数据加载失败，请稍后重试`;
              // TODO show error
              console.error(error.handled || message);
            }

            throw error;
          }
        } finally {
          asyncRequests.delete(field);
          this[storeKey][field][stateKey] = false;
        }
      },

      async $_clearAsyncData() {
        this[storeKey] = normalizeFields(fields, {
          dataKey,
          stateKey,
        });
      },
    },

    beforeDestroy() {
      if (asyncRequests.size) {
        asyncRequests.forEach(request => {
          if (request.cancel) {
            request.cancel('request cancelled due to component destruction');
          }
        });
        asyncRequests.clear();
      }
    },
  };
};
