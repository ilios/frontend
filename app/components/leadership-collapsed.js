import Component from '@ember/component';

export default Component.extend({
  administratorsCount: null,
  directorsCount: null,
  showDirectors: true,
  showAdministrators: true,
  tagName: 'section',
  classNames: ['leadership-collapsed'],
  'data-test-leadership-collapsed': true,
});
