import Component from '@ember/component';
import layout from '../templates/components/leadership-list';


export default Component.extend({
  layout,
  classNames: ['leadership-list'],
  administrators: null,
  directors: null,
  showDirectors: true,
  showAdministrators: true,
  'data-test-leadership-list': true,
});
