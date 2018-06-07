import EmberObject from '@ember/object';
import Service from '@ember/service';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { startMirage } from 'ilios/initializers/ember-cli-mirage';

const { resolve } = RSVP;

moduleForComponent('unassigned-students-summary', 'Integration | Component | unassigned students summary', {
  integration: true,
  setup(){
    this.server = startMirage();
  },
  teardown() {
    this.server.shutdown();
  }
});

test('it renders', function (assert) {
  const school = this.server.create('school', {
    id: 1,
    title: 'school 0',
  });
  this.server.create('school', {
    id: 2,
    title: 'school 1',
  });
  this.server.create('user', {
    school
  });
  const school1Mock = EmberObject.create(this.server.db.schools[0]);
  const school2Mock = EmberObject.create(this.server.db.schools[1]);
  const currentUserMock = Service.extend({
    model: resolve(EmberObject.create({
      school: resolve(school1Mock)
    }))
  });
  const studentRole = this.server.create('user-role', {
    id: 4,
    title: 'Student'
  });
  this.server.createList('user', 5, {
    school,
    roles: [studentRole]
  });

  this.server.get('api/users', ({ db }, { queryParams }) => {
    assert.equal(queryParams['filters[school]'], 1);
    assert.deepEqual(queryParams['filters[roles]'], ['4']);
    assert.equal(queryParams['filters[cohorts]'], '');

    const users = db.users.find([2, 3, 4, 5, 6]);

    return { users };
  });

  this.register('service:currentUser', currentUserMock);

  this.set('schools', [school1Mock, school2Mock]);
  this.render(hbs`{{unassigned-students-summary schools=schools}}`);

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
  let primarySchool = EmberObject.create({
    id: 1,
    title: 'school 0',
  });
  let user = EmberObject.create({
    school: resolve(primarySchool)
  });
  let currentUserMock = Service.extend({
    model: resolve(user)
  });

  this.register('service:currentUser', currentUserMock);

  this.set('schools', [primarySchool]);
  this.render(hbs`{{unassigned-students-summary schools=schools}}`);

  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Students Requiring Cohort Assignment/), 0);
    assert.notEqual(this.$().text().trim().search(/There are 0 students needing assignment to a cohort/), -1);

    assert.notOk(this.$('div').eq(0).hasClass('alert'));
    assert.equal(this.$('button').length, 0);
  });
});
