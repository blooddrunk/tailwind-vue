export default ({ name = 'list' } = {}) => {
  return {
    data: () => ({
      [name]: {
        error: null,
        items: [],
        loading: false,
        total: 0,
      },
    }),
  };
};
