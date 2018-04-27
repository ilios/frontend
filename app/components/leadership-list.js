import Component from '@ember/component';

export default Component.extend({
  classNames: ['leadership-list'],
  administrators: null,
  directors: null,
  showDirectors: true,
  showAdministrators: true,
  'data-test-leadership-list': true,
});
