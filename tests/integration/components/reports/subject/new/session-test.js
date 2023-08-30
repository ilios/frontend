import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/new/session';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | reports/subject/new/session', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.server.create('academicYear', { id: 2027 });
    this.server.create('academicYear', { id: 2006 });
    const [school1, school2] = this.server.createList('school', 2);

    const course1 = this.server.create('course', {
      school: school1,
      year: 2006,
    });
    const course2 = this.server.create('course', {
      school: school2,
      year: 2027,
    });
    this.server.createList('session', 2, { course: course1 });
    this.server.createList('session', 3, { course: course2 });
  });

  test('it renders', async function (assert) {
    assert.expect(24);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::Session
      @currentId={{this.currentId}}
      @changeId={{this.changeId}}
      @school={{null}}
     />`);

    assert.strictEqual(component.session.options.length, 5);

    assert.strictEqual(component.session.options[0].text, '2006 | session 0 course 0');
    assert.ok(component.session.options[0].isSelected);
    assert.strictEqual(component.session.value, '1');

    assert.strictEqual(component.session.options[1].text, '2006 | session 1 course 0');
    assert.notOk(component.session.options[1].isSelected);
    assert.strictEqual(component.session.options[2].text, '2027 | session 2 course 1');
    assert.notOk(component.session.options[2].isSelected);
    assert.strictEqual(component.session.options[3].text, '2027 | session 3 course 1');
    assert.notOk(component.session.options[3].isSelected);
    assert.strictEqual(component.session.options[4].text, '2027 | session 4 course 1');
    assert.notOk(component.session.options[4].isSelected);

    assert.strictEqual(component.year.options.length, 3);
    assert.strictEqual(component.year.options[0].text, 'All Academic Years');
    assert.ok(component.year.options[0].isSelected);
    assert.strictEqual(component.year.value, '');

    assert.strictEqual(component.year.options[1].text, '2027 - 2028');
    assert.notOk(component.year.options[1].isSelected);
    assert.strictEqual(component.year.options[2].text, '2006 - 2007');
    assert.notOk(component.year.options[2].isSelected);

    this.set('currentId', '3');
    assert.notOk(component.session.options[0].isSelected);
    assert.ok(component.session.options[2].isSelected);
    assert.strictEqual(component.session.value, '3');
  });

  test('it works', async function (assert) {
    assert.expect(7);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::Session
      @currentId={{this.currentId}}
      @changeId={{this.changeId}}
      @school={{null}}
     />`);

    assert.strictEqual(component.session.options.length, 5);
    assert.strictEqual(component.year.options.length, 3);

    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });

    await component.session.set('3');
    assert.notOk(component.session.options[0].isSelected);
    assert.ok(component.session.options[2].isSelected);
    assert.strictEqual(component.session.value, '3');
  });

  test('it filters by year', async function (assert) {
    await render(hbs`<Reports::Subject::New::Session
      @currentId={{null}}
      @changeId={{(noop)}}
      @school={{null}}
     />`);

    assert.strictEqual(component.session.options.length, 5);
    await component.year.set('2027');
    assert.strictEqual(component.session.options.length, 3);
    await component.year.set('');
    assert.strictEqual(component.session.options.length, 5);
  });

  test('it filters by school', async function (assert) {
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', 2);
    this.set('school', schoolModel);
    await render(hbs`<Reports::Subject::New::Session
      @currentId={{null}}
      @changeId={{(noop)}}
      @school={{this.school}}
     />`);

    assert.strictEqual(component.session.options.length, 3);
    assert.strictEqual(component.session.options[0].text, '2027 | session 2 course 1');
    assert.strictEqual(component.session.options[1].text, '2027 | session 3 course 1');
    assert.strictEqual(component.session.options[2].text, '2027 | session 4 course 1');

    assert.strictEqual(component.year.options.length, 2);
    assert.strictEqual(component.year.options[0].text, 'All Academic Years');
    assert.strictEqual(component.year.options[1].text, '2027 - 2028');
  });

  test('changing school resets default value', async function (assert) {
    assert.expect(4);
    const schoolModels = await this.owner.lookup('service:store').findAll('school');
    this.set('school', schoolModels[0]);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(hbs`<Reports::Subject::New::Session
      @currentId={{null}}
      @changeId={{this.changeId}}
      @school={{this.school}}
     />`);

    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
    });
    this.set('school', schoolModels[1]);

    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
    });
    this.set('school', null);

    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
    });
    this.set('school', schoolModels[0]);
  });
});
