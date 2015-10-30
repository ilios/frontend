import Ember from 'ember';

const { Component, computed, inject, isBlank } = Ember;
const { service } = inject;

export default Component.extend({
  classNames: ['resultslist-new'],

  i18n: service(),
  placeholder: computed('i18n.locale', function() {
    return this.get('i18n').t('programYears.selectAcademicYear');
  }),

  selection: null,

  selectionCheck() {
    const selection = this.get('selection');

    return isBlank(selection) ? true : false;
  },

  actions: {
    changeSelection(value) {
      this.set('selection', value);
    },

    save() {
      if (this.selectionCheck()) {
        return;
      }

      const startYear = this.get('selection.value');
      this.sendAction('save', startYear);
    },

    cancel() {
      this.sendAction('cancel');
    }
  }
});
