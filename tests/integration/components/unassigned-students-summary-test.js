import EmberObject from '@ember/object';
import Service from '@ember/service';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const { resolve } = RSVP;

module('Integration | Component | unassigned students summary', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
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

    this.owner.register('service:currentUser', currentUserMock);

    this.set('schools', [school1Mock, school2Mock]);
    await render(hbs`{{unassigned-students-summary schools=schools}}`);

    assert.equal(this.element.textContent.trim().search(/Students Requiring Cohort Assignment/), 0);
    assert.notEqual(this.element.textContent.trim().search(/There are 5 students needing assignment to a cohort/), -1);

    let options = findAll('option');
    assert.equal(options.length, 2);
    assert.dom(options[0]).hasText('school 0');
    assert.dom(options[1]).hasText('school 1');

    assert.dom('button').exists({ count: 1 });
    assert.dom('div:nth-of-type(2)').hasClass('alert');
  });

  test('it renders empty', async function(assert) {
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

    this.owner.register('service:currentUser', currentUserMock);

    this.set('schools', [primarySchool]);
    await render(hbs`{{unassigned-students-summary schools=schools}}`);
    assert.equal(this.element.textContent.trim().search(/Students Requiring Cohort Assignment/), 0);
    assert.notEqual(this.element.textContent.trim().search(/There are 0 students needing assignment to a cohort/), -1);

    assert.dom('div:nth-of-type(2)').hasNoClass('alert');
    assert.dom('button').doesNotExist();
  });
});
