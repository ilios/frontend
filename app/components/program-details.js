import Component from '@ember/component';

export default Component.extend({
  classNames: ['program-details'],
  tagName: 'section',

  'data-test-program-details': true,

  canUpdate: false,
  program: null
});
