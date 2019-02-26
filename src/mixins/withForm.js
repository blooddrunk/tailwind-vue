import clone from 'lodash/clone';

export default (initialData = {}, { idKey = 'id' } = {}) => ({
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

    isFormDirty() {
      if (this.formFields) {
        return Object.keys(this.formFields).some(key => this.formFields[key].dirty);
      }

      return false;
    },
  },

  methods: {
    async $_validateForm() {
      if (this.$validator) {
        return this.$validator.validate();
      }
      return true;
    },

    $_collectFirstError() {
      if (this.formErrors) {
        const errors = this.formErrors.collect();
        const errorFields = Object.keys(errors);
        if (!errorFields || !errorFields.length) {
          return null;
        }

        const firstField = errorFields[0];
        return {
          field: firstField,
          error: errors[firstField][0],
        };
      }

      return null;
    },

    async $_clearFormError() {
      this.formState.fetchError = null;
      this.formState.saveError = null;
      this.formState.validationError = null;

      if (this.$validator) {
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

    async $_saveForm(config) {
      this.formState.saveError = null;
      this.formState.validationError = null;

      const valid = await this.$_validateForm();
      if (!valid) {
        const validationError = new Error('请检查您填写的内容');
        this.formState.validationError = validationError;
        throw validationError;
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
  },
});
