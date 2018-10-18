import Component from '@ember/component';
import layout from '../templates/components/boolean-check';

export default Component.extend({
  layout,
  classNames: ['checkbox'],

  tagName: 'span',

  value: false,

  click() {
    return false;
  }
});
