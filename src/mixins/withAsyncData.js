import { isCancel } from 'axios';

import { HTTPError } from '@/utils/errors';
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
  const { dataKey = 'data', stateKey = 'loading' } = config;

  if (!Array.isArray(fields)) {
    console.error('[withAsyncData] ', 'field config should be an array');
    return;
  }

  const asyncRequests = new Map();

  return {
    data: () => ({
      asyncData: normalizeFields(fields, {
        dataKey,
        stateKey,
      }),
    }),
    methods: {
      async $_fetchAsyncData(field, config, label = '') {
        if (!this.asyncData.hasOwnProperty(field)) {
          console.error('[withAsyncData] ', field, 'not defined in asyncData');
          return;
        }

        if (!asyncRequests.has(field)) {
          asyncRequests.set(field, takeLatest(this.$axios));
        }

        this.asyncData[field][stateKey] = true;
        try {
          const { data } = await asyncRequests.get(field)(config);
          this.asyncData[field][dataKey] = data;
          return data;
        } catch (error) {
          this.asyncData[field][dataKey] = [];
          if (!isCancel(error)) {
            const message = `${label}数据加载失败，请稍后重试`;
            throw new HTTPError(message, true);
          }
        } finally {
          this.asyncData[field][stateKey] = false;
        }
      },
      async $_clearAsyncData() {
        this.asyncData = normalizeFields(fields, {
          dataKey,
          stateKey,
        });
      },
    },
  };
};
