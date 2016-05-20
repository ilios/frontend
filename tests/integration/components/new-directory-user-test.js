import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/ember-i18n";

const { Service, Object, RSVP } = Ember;
const { resolve } = RSVP;

const mockSchools = [
  {id: 2, title: 'second', cohorts: resolve([])},
  {id: 1, title: 'first', cohorts: resolve([])},
  {id: 3, title: 'third', cohorts: resolve([])},
];
const mockUser = Object.create({
  schools: resolve(mockSchools),
  school: resolve(Object.create(mockSchools[0]))
});

const currentUserMock = Service.extend({
  model: resolve(mockUser)
});

moduleForComponent('new-directory-user', 'Integration | Component | new directory user', {
  integration: true,
  setup(){
    initializer.initialize(this);
  },
  beforeEach(){
    this.register('service:current-user', currentUserMock);
    this.inject.service('current-user', { as: 'current-user' });
  }
});

test('it renders', function(assert) {

  let storeMock = Service.extend({
    query(what, {filters}){

      assert.equal('cohort', what);
      assert.equal(filters.schools[0], 2);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);
  this.set('nothing', () => {});

  this.render(hbs`{{new-directory-user close=(action nothing) setSearchTerms=(action nothing)}}`);

  return wait().then(() => {
    let content = this.$().text().trim();
    assert.notEqual(content.search(/Search directory for new users/), -1);
  });
});
