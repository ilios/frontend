import Component from '@ember/component';
import DomMixin from 'ember-lifeline/mixins/dom';
import { computed } from '@ember/object';

export default Component.extend(DomMixin, {
  classNameBindings: [':sessions-grid-header', 'isFixed'],
  tagName: 'thead',
  distanceToTopOfWindow: 0,
  isFixed: computed('distanceToTopOfWindow', function () {
    const distanceToTopOfWindow = this.distanceToTopOfWindow;
    return distanceToTopOfWindow <= 0;
  }),
  didInsertElement() {
    this._super();
    this.addEventListener(window, 'scroll', () => {
      const rect = this.element.getBoundingClientRect();
      this.set('distanceToTopOfWindow', rect.top);
    });
  },

});
