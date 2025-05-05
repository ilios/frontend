import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/course';
import Course from 'frontend/components/reports/subject/new/course';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/subject/new/course', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('academic-year', { id: 2022 });
    this.server.create('academic-year', { id: 2015 });
    const [school1, school2] = this.server.createList('school', 2);
    this.server.createList('course', 2, { school: school1, year: 2015 });
    this.server.createList('course', 3, { school: school2, year: 2022 });
  });

  test('it renders', async function (assert) {
    await render(
      <template><Course @currentId={{null}} @changeId={{(noop)}} @school={{null}} /></template>,
    );

    assert.notOk(component.hasSelectedCourse);

    await component.input('course');
    await component.search();

    assert.strictEqual(component.results.length, 5);

    assert.strictEqual(component.results[0].text, '2022 course 2');
    assert.strictEqual(component.results[1].text, '2022 course 3');
    assert.strictEqual(component.results[2].text, '2022 course 4');
    assert.strictEqual(component.results[3].text, '2015 course 0');
    assert.strictEqual(component.results[4].text, '2015 course 1');
  });

  test('it renders selected course', async function (assert) {
    await render(
      <template><Course @currentId="2" @changeId={{(noop)}} @school={{null}} /></template>,
    );

    assert.ok(component.hasSelectedCourse);
    assert.strictEqual(component.selectedCourse, '2015 course 1');
  });

  test('it works', async function (assert) {
    assert.expect(4);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(
      <template>
        <Course @currentId={{this.currentId}} @changeId={{this.changeId}} @school={{null}} />
      </template>,
    );

    await component.input('course');
    await component.search();
    assert.strictEqual(component.results.length, 5);

    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });

    await component.results[0].click();
    assert.ok(component.hasSelectedCourse);
    assert.strictEqual(component.selectedCourse, '2022 course 2');
  });

  test('it filters by school', async function (assert) {
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', 2);
    this.set('school', schoolModel);
    await render(
      <template>
        <Course @currentId={{null}} @changeId={{(noop)}} @school={{this.school}} />
      </template>,
    );

    await component.input('course');
    await component.search();

    assert.strictEqual(component.results.length, 3);
    assert.strictEqual(component.results[0].text, '2022 course 2');
    assert.strictEqual(component.results[1].text, '2022 course 3');
    assert.strictEqual(component.results[2].text, '2022 course 4');
  });

  test('it sorts', async function (assert) {
    assert.expect(6);
    this.server.db.courses.update(1, { title: 'xx', externalId: 'course1' });
    this.server.db.courses.update(3, { title: 'aa', externalId: 'course2' });
    await render(
      <template><Course @currentId={{null}} @changeId={{(noop)}} @school={{null}} /></template>,
    );

    await component.input('course');
    await component.search();
    assert.strictEqual(component.results.length, 5);

    assert.strictEqual(component.results[0].text, '2022 [course2] aa');
    assert.strictEqual(component.results[1].text, '2022 course 3');
    assert.strictEqual(component.results[2].text, '2022 course 4');
    assert.strictEqual(component.results[3].text, '2015 course 1');
    assert.strictEqual(component.results[4].text, '2015 [course1] xx');
  });
});
