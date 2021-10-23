import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { component } from 'ilios/tests/pages/components/dashboard-mycourses';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | dashboard mycourses', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('list courses for privileged users', async function (assert) {
    const user = this.server.create('user');
    const jwtObject = {
      user_id: user.id,
      performs_non_learner_function: true,
    };
    const encodedData = window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
    await authenticateSession({
      jwt: encodedData,
    });

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user],
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.equal(component.title, 'My Courses');
    assert.equal(component.courses.length, 3);
    assert.equal(component.courses[0].text, '2013 course 0 (ABC123)');
    assert.equal(component.courses[1].text, '2013 course 1');
    assert.equal(component.courses[2].text, '2013 course 2');
    assert.ok(component.courses[0].isLinked);
    assert.ok(component.courses[1].isLinked);
    assert.ok(component.courses[2].isLinked);
    a11yAudit(this.element);
  });

  test('list courses for un-privileged users', async function (assert) {
    const user = this.server.create('user');
    const jwtObject = {
      user_id: user.id,
      performs_non_learner_function: false,
    };
    const encodedData = window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
    await authenticateSession({
      jwt: encodedData,
    });

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user],
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.equal(component.courses.length, 3);
    assert.equal(component.courses[0].text, '2013 course 0');
    assert.equal(component.courses[1].text, '2013 course 1');
    assert.equal(component.courses[2].text, '2013 course 2');
    assert.notOk(component.courses[0].isLinked);
    assert.notOk(component.courses[1].isLinked);
    assert.notOk(component.courses[2].isLinked);
    a11yAudit(this.element);
  });

  test('display none when no courses', async function (assert) {
    await authenticateSession();
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.equal(component.courses.length, 1);
    assert.equal(component.courses[0].text, 'None');
    a11yAudit(this.element);
  });

  test('show academic-year range for privileged users', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const user = this.server.create('user');
    const jwtObject = {
      user_id: user.id,
      performs_non_learner_function: true,
    };
    const encodedData = window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
    await authenticateSession({
      jwt: encodedData,
    });

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user],
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.equal(component.courses[0].text, '2013 - 2014 course 0 (ABC123)');
    assert.equal(component.courses[1].text, '2013 - 2014 course 1');
    assert.equal(component.courses[2].text, '2013 - 2014 course 2');
  });

  test('show academic-year range for un-privileged users', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const user = this.server.create('user');
    const jwtObject = {
      user_id: user.id,
      performs_non_learner_function: false,
    };
    const encodedData = window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
    await authenticateSession({
      jwt: encodedData,
    });

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user],
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.equal(component.courses[0].text, '2013 - 2014 course 0');
    assert.equal(component.courses[1].text, '2013 - 2014 course 1');
    assert.equal(component.courses[2].text, '2013 - 2014 course 2');
  });
});
