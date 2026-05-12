import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'frontend/tests/pages/components/reports/subject/new/course';
import Course from 'frontend/components/reports/subject/new/course';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/subject/new/course', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    await this.server.create('academic-year', { id: 2022 });
    await this.server.create('academic-year', { id: 2015 });
    const [school1, school2] = await this.server.createList('school', 2);
    await this.server.createList('course', 2, { school: school1, year: 2015 });
    await this.server.createList('course', 3, { school: school2, year: 2022 });
    this.school1 = school1;
    this.school2 = school2;
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
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.step('changeId called');
      assert.strictEqual(id, '3');
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

    await component.results[0].click();
    assert.ok(component.hasSelectedCourse);
    assert.strictEqual(component.selectedCourse, '2022 course 2');
    assert.verifySteps(['changeId called']);
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
    await this.server.create('course', { school: this.school1, year: 2015, externalId: 'xx' });
    await this.server.create('course', { school: this.school2, year: 2022, externalId: 'aa' });
    await render(
      <template><Course @currentId={{null}} @changeId={{(noop)}} @school={{null}} /></template>,
    );

    await component.input('course');
    await component.search();
    assert.strictEqual(component.results.length, 7);
    assert.strictEqual(component.results[0].text, '2022 course 2');
    assert.strictEqual(component.results[1].text, '2022 course 3');
    assert.strictEqual(component.results[2].text, '2022 course 4');
    assert.strictEqual(component.results[3].text, '2022 [aa] course 6');
    assert.strictEqual(component.results[4].text, '2015 course 0');
    assert.strictEqual(component.results[5].text, '2015 course 1');
    assert.strictEqual(component.results[6].text, '2015 [xx] course 5');
  });
});
