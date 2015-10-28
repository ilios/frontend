import Ember from 'ember';
import InPlaceValidation from 'ilios/mixins/inplace-validation';

const { Component, computed, ObjectProxy } = Ember;
const { notEmpty } = computed;

export default Component.extend(InPlaceValidation, {
  classNames: ['editinplace', 'inplace-select'],

  selectPromptTranslation: null,

  showSelectPrompt: notEmpty('selectPromptTranslation'),

  selectPrompt: computed('i18n.locale', 'selectPromptTranslation', {
    get() {
      return this.get('i18n').t(this.get('selectPromptTranslation'));
    }
  }).readOnly(),

  options: [],
  optionLabelPath: 'title',
  optionValuePath: 'id',

  displayValueOverride: null,

  displayValue: computed('value', 'displayValueOverride', 'displayValueOverride.content', 'proxiedOptions.[].{value,label}', 'clickPrompt', function() {
    const component = this;
    const displayValueOverride = this.get('displayValueOverride');
    let displayValue;

    if (displayValueOverride) {
      return displayValueOverride;
    }

    const value = this.get('value');
    const proxiedOptions = this.get('proxiedOptions');

    if (value && proxiedOptions) {
      let option = proxiedOptions.find((option) => {
        return option.get('value') === component.get('value');
      });

      if (option) {
        displayValue = option.get('label');
      }
    }
    if (!displayValue) {
      displayValue = this.get('clickPrompt');
    }

    return displayValue;
  }),

  proxiedOptions: computed('options.[]', 'optionLabelPath', 'optionValuePath', 'selectPromptTranslation', function() {
    let options = this.get('options');

    let objectProxy = ObjectProxy.extend({
      optionValuePath: this.get('optionValuePath'),
      optionLabelPath: this.get('optionLabelPath'),
      value: computed('content', 'optionValuePath', function() {
        return this.get('content').get(this.get('optionValuePath'));
      }),
      label: computed('content', 'optionLabelPath', function() {
        return this.get('content').get(this.get('optionLabelPath'));
      })
    });

    return options.map((option) => {
      return objectProxy.create({
        content: option
      });
    });
  }),

  actions: {
    changeSelection(newValue) {
      newValue = newValue === 'null' ? null : newValue;
      this.send('changeValue', newValue);
    }
  }
});
