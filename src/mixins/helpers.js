const noopData = () => ({});

export const mergeData = (Component, initialData) => {
  const ComponentData = Component.$options.data || noopData;
  Component.$options.data = () => {
    const data = ComponentData.call(this);
    return {
      ...data,
      ...initialData,
    };
  };
};
