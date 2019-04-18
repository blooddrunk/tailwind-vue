import { CancelToken } from 'axios';

export const takeLatest = axiosCall => {
  let cancel;

  return config => {
    if (cancel) {
      cancel('Only one request allowed at a time.');
    }

    const request = axiosCall({
      ...config,
      cancelToken: new CancelToken(c => {
        cancel = c;
      }),
    });
    request.cancel = cancel;
    return request;
  };
};
