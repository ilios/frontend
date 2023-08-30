import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/new/course';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | reports/subject/new/course', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.server.create('academicYear', { id: 2022 });
    this.server.create('academicYear', { id: 2015 });
    const [school1, school2] = this.server.createList('school', 2);
    this.server.createList('course', 2, { school: school1, year: 2015 });
    this.server.createList('course', 3, { school: school2, year: 2022 });
  });

  test('it renders', async function (assert) {
    assert.expect(24);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::Course
      @currentId={{this.currentId}}
      @changeId={{this.changeId}}
      @school={{null}}
     />`);

    assert.strictEqual(component.course.options.length, 5);

    assert.strictEqual(component.course.options[0].text, '2015 course 0');
    assert.ok(component.course.options[0].isSelected);
    assert.strictEqual(component.course.value, '1');

    assert.strictEqual(component.course.options[1].text, '2015 course 1');
    assert.notOk(component.course.options[1].isSelected);
    assert.strictEqual(component.course.options[2].text, '2022 course 2');
    assert.notOk(component.course.options[2].isSelected);
    assert.strictEqual(component.course.options[3].text, '2022 course 3');
    assert.notOk(component.course.options[3].isSelected);
    assert.strictEqual(component.course.options[4].text, '2022 course 4');
    assert.notOk(component.course.options[4].isSelected);

    assert.strictEqual(component.year.options.length, 3);
    assert.strictEqual(component.year.options[0].text, 'All Academic Years');
    assert.ok(component.year.options[0].isSelected);
    assert.strictEqual(component.year.value, '');

    assert.strictEqual(component.year.options[1].text, '2022 - 2023');
    assert.notOk(component.year.options[1].isSelected);
    assert.strictEqual(component.year.options[2].text, '2015 - 2016');
    assert.notOk(component.year.options[2].isSelected);

    this.set('currentId', '3');
    assert.notOk(component.course.options[0].isSelected);
    assert.ok(component.course.options[2].isSelected);
    assert.strictEqual(component.course.value, '3');
  });

  test('it works', async function (assert) {
    assert.expect(7);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::Course
      @currentId={{this.currentId}}
      @changeId={{this.changeId}}
      @school={{null}}
     />`);

    assert.strictEqual(component.course.options.length, 5);
    assert.strictEqual(component.year.options.length, 3);

    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });

    await component.course.set('3');
    assert.notOk(component.course.options[0].isSelected);
    assert.ok(component.course.options[2].isSelected);
    assert.strictEqual(component.course.value, '3');
  });

  test('it filters by year', async function (assert) {
    await render(hbs`<Reports::Subject::New::Course
      @currentId={{null}}
      @changeId={{(noop)}}
      @school={{null}}
     />`);

    assert.strictEqual(component.course.options.length, 5);
    await component.year.set('2022');
    assert.strictEqual(component.course.options.length, 3);
    await component.year.set('');
    assert.strictEqual(component.course.options.length, 5);
  });

  test('it filters by school', async function (assert) {
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', 2);
    this.set('school', schoolModel);
    await render(hbs`<Reports::Subject::New::Course
      @currentId={{null}}
      @changeId={{(noop)}}
      @school={{this.school}}
     />`);

    assert.strictEqual(component.course.options.length, 3);
    assert.strictEqual(component.course.options[0].text, '2022 course 2');
    assert.strictEqual(component.course.options[1].text, '2022 course 3');
    assert.strictEqual(component.course.options[2].text, '2022 course 4');

    assert.strictEqual(component.year.options.length, 2);
    assert.strictEqual(component.year.options[0].text, 'All Academic Years');
    assert.strictEqual(component.year.options[1].text, '2022 - 2023');
  });

  test('changing school resets default value', async function (assert) {
    assert.expect(4);
    const schoolModels = await this.owner.lookup('service:store').findAll('school');
    this.set('school', schoolModels[0]);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(hbs`<Reports::Subject::New::Course
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

  test('it sorts', async function (assert) {
    assert.expect(10);
    this.server.db.courses.update(1, { title: 'xx' });
    this.server.db.courses.update(3, { title: 'aa' });
    await render(hbs`<Reports::Subject::New::Course
      @currentId={{null}}
      @changeId={{(noop)}}
      @school={{null}}
     />`);

    assert.strictEqual(component.course.options.length, 5);

    assert.strictEqual(component.course.options[0].text, '2015 course 1');
    assert.strictEqual(component.course.options[1].text, '2015 xx');
    assert.strictEqual(component.course.options[2].text, '2022 aa');
    assert.strictEqual(component.course.options[3].text, '2022 course 3');
    assert.strictEqual(component.course.options[4].text, '2022 course 4');

    await component.year.set('2022');
    assert.strictEqual(component.course.options.length, 3);
    assert.strictEqual(component.course.options[0].text, 'aa');
    assert.strictEqual(component.course.options[1].text, 'course 3');
    assert.strictEqual(component.course.options[2].text, 'course 4');
  });
});
