import Component from '@ember/component';

export default Component.extend({
  classNames: ['expand-collapse-button'],
  'data-test-expand-collapse-button': true,

  value: false,
});
