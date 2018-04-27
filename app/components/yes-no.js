import Component from '@ember/component';

export default Component.extend({
  tagName: 'span',
  classNameBindings: ['value:yes:no'],
  value: false,
});
