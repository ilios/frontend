import Component from '@ember/component';
import layout from '../templates/components/leadership-collapsed';

export default Component.extend({
  layout,
  administratorsCount: null,
  directorsCount: null,
  showDirectors: true,
  showAdministrators: true,
  tagName: 'section',
  classNames: ['leadership-collapsed'],
  'data-test-leadership-collapsed': true,
});
