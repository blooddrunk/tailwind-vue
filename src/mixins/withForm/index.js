import clone from 'lodash/clone';

import withValidation from './withValidation';

export default (initialData = {}, { idKey = 'id' } = {}) => ({
  mixins: [withValidation],

  data: () => ({
    formState: {
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
    },
  }),

  computed: {
    formId() {
      return this.formState.data && this.formState.data[idKey];
    },

    formData() {
      return this.formState.data;
    },
  },

  methods: {
    async $_clearFormError() {
      this.formState.fetchError = null;
      this.formState.saveError = null;
      this.formState.validationError = null;

      if (this.validationEnabled) {
        await this.$validator.reset();
      }
    },

    async $_clearForm() {
      this.formState.data = { ...this.formState.initialData };

      await this.$_clearFormError();
    },

    async $_resetForm() {
      this.formState.data = { ...this.formState.defaultData };

      await this.$_clearFormError();
    },

    $_updateForm(data, { setDefault = true } = {}) {
      this.formState.data = {
        ...this.formState.data,
        ...data,
      };

      if (setDefault) {
        this.formState.defaultData = clone(this.formState.data);
      }
    },

    async $_fetchForm({ defaultData = {}, ...config }) {
      this.formState.fetchError = null;
      this.formState.loading = true;

      try {
        const response = await this.$axios(config);

        this.formState.data = {
          ...defaultData,
          ...response.data,
        };

        // fetched successfully, update default data
        this.formState.defaultData = clone(this.formState.data);

        this.$emit('form-fetched', response);

        return response;
      } catch (error) {
        this.formState.fetchError = error;

        // FIXME DO NOT throw maybe?
        throw error;
      } finally {
        this.formState.loading = false;
      }
    },

    async $_saveForm(config) {
      this.formState.saveError = null;
      this.formState.validationError = null;

      if (this.validationEnabled) {
        await this.$_validateForm();
      }

      this.formState.saveError = null;
      this.formState.saving = true;

      try {
        const response = await this.$axios(config);

        // saved successfully, update default data
        this.formState.defaultData = clone(this.formState.data);

        this.$emit('form-saved', response);

        return response;
      } catch (error) {
        this.formState.saveError = error;

        // FIXME DO NOT  throw maybe?
        throw error;
      } finally {
        this.formState.saving = false;
      }
    },
  },
});
