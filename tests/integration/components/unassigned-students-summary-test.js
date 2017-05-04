import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import startMirage from '../../helpers/start-mirage';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject, Service, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('unassigned-students-summary', 'Integration | Component | unassigned students summary', {
  integration: true,
  setup(){
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  let primarySchool = EmberObject.create(server.create('school'));
  let secondarySchool = EmberObject.create(server.create('school'));
  let user = EmberObject.create({
    school: resolve(primarySchool),
    schools: resolve([primarySchool, secondarySchool])
  });
  let currentUserMock = Service.extend({
    model: resolve(user)
  });

  let storeMock = Service.extend({
    query(what, {limit, filters}){
      assert.equal(limit, 1000);
      assert.equal(filters.school, 1);
      assert.equal('user', what);
      return resolve([1, 2, 3, 4, 5]);
    }
  });

  this.register('service:currentUser', currentUserMock);
  this.register('service:store', storeMock);

  this.render(hbs`{{unassigned-students-summary}}`);

  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Students Requiring Cohort Assignment/), 0);
    assert.notEqual(this.$().text().trim().search(/There are 5 students needing assignment to a cohort/), -1);

    let options = this.$('option');
    assert.equal(options.length, 2);
    assert.equal(options.eq(0).text().trim(), 'school 0');
    assert.equal(options.eq(1).text().trim(), 'school 1');

    assert.equal(this.$('button').length, 1);

    assert.ok(this.$('div').eq(0).hasClass('alert'));
  });
});

test('it renders empty', function(assert) {
  let primarySchool = EmberObject.create(server.create('school'));
  let user = EmberObject.create({
    school: resolve(primarySchool),
    schools: resolve([primarySchool])
  });
  let currentUserMock = Service.extend({
    model: resolve(user)
  });

  let storeMock = Service.extend({
    query(){
      return resolve([]);
    }
  });

  this.register('service:currentUser', currentUserMock);
  this.register('service:store', storeMock);

  this.render(hbs`{{unassigned-students-summary}}`);

  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Students Requiring Cohort Assignment/), 0);
    assert.notEqual(this.$().text().trim().search(/There are 0 students needing assignment to a cohort/), -1);

    assert.notOk(this.$('div').eq(0).hasClass('alert'));
    assert.equal(this.$('button').length, 0);
  });
});
