import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/session';
import Session from 'frontend/components/reports/subject/new/session';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/subject/new/session', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('academic-year', { id: 2027 });
    this.server.create('academic-year', { id: 2006 });
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
    assert.expect(6);
    await render(
      <template><Session @currentId={{null}} @changeId={{(noop)}} @school={{null}} /></template>,
    );

    await component.input('session');
    assert.strictEqual(component.results.length, 5);

    assert.strictEqual(component.results[0].text, '2027 | session 2 course 1');
    assert.strictEqual(component.results[1].text, '2027 | session 3 course 1');
    assert.strictEqual(component.results[2].text, '2027 | session 4 course 1');
    assert.strictEqual(component.results[3].text, '2006 | session 0 course 0');
    assert.strictEqual(component.results[4].text, '2006 | session 1 course 0');
  });

  test('it renders selected session', async function (assert) {
    assert.expect(2);
    this.set('currentId', 3);
    await render(
      <template>
        <Session @currentId={{this.currentId}} @changeId={{(noop)}} @school={{null}} />
      </template>,
    );

    assert.ok(component.hasSelectedSession);
    assert.strictEqual(component.selectedSession, '2027 | session 2 course 1');
  });

  test('it works', async function (assert) {
    assert.expect(4);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '5');
      this.set('currentId', id);
    });
    await render(
      <template>
        <Session @currentId={{this.currentId}} @changeId={{this.changeId}} @school={{null}} />
      </template>,
    );

    await component.input('session');

    assert.strictEqual(component.results.length, 5);
    await component.results[2].click();
    assert.ok(component.hasSelectedSession);
    assert.strictEqual(component.selectedSession, '2027 | session 4 course 1');
  });

  test('it filters by school', async function (assert) {
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', 2);
    this.set('school', schoolModel);
    await render(
      <template>
        <Session @currentId={{null}} @changeId={{(noop)}} @school={{this.school}} />
      </template>,
    );

    await component.input('session');

    assert.strictEqual(component.results.length, 3);
    assert.strictEqual(component.results[0].text, '2027 | session 2 course 1');
    assert.strictEqual(component.results[1].text, '2027 | session 3 course 1');
    assert.strictEqual(component.results[2].text, '2027 | session 4 course 1');
  });
});
