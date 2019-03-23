import Component from '@ember/component';
import layout from '../templates/components/selectable-terms-list';

export default Component.extend({
  layout,
  classNames: ['selectable-terms-list'],
  tagName: 'ul',
  selectedTerms: null,
  terms: null,
  actions: {
    add(term) {
      this.add(term);

    },
    remove(term) {
      this.remove(term);
    }
  }
});
