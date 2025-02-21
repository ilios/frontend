import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/instructor-group';

module('Integration | Component | reports/subject/new/instructor-group', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const [school1, school2] = this.server.createList('school', 2);
    this.server.createList('instructor-group', 2, { school: school1 });
    this.server.createList('instructor-group', 3, { school: school2 });
  });

  test('it renders', async function (assert) {
    assert.expect(15);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::InstructorGroup
  @currentId={{this.currentId}}
  @changeId={{this.changeId}}
  @school={{null}}
/>`);

    assert.strictEqual(component.options.length, 5);
    assert.strictEqual(component.options[0].text, 'instructor group 0');
    assert.ok(component.options[0].isSelected);
    assert.strictEqual(component.value, '1');

    for (let i = 1; i < 5; i++) {
      assert.strictEqual(component.options[i].text, `instructor group ${i}`);
      assert.notOk(component.options[i].isSelected);
    }

    this.set('currentId', '3');
    assert.notOk(component.options[0].isSelected);
    assert.ok(component.options[2].isSelected);
    assert.strictEqual(component.value, '3');
  });

  test('it works', async function (assert) {
    assert.expect(5);
    this.set('currentId', '1');
    await render(hbs`<Reports::Subject::New::InstructorGroup
  @currentId={{this.currentId}}
  @changeId={{this.changeId}}
  @school={{null}}
/>`);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });
    assert.ok(component.options[0].isSelected);
    await component.set('3');
    assert.notOk(component.options[0].isSelected);
    assert.ok(component.options[2].isSelected);
    assert.strictEqual(component.value, '3');
  });

  test('it filters by school', async function (assert) {
    assert.expect(7);
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', 2);
    this.set('currentId', null);
    this.set('school', schoolModel);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::InstructorGroup
  @currentId={{this.currentId}}
  @changeId={{this.changeId}}
  @school={{this.school}}
/>`);

    assert.strictEqual(component.options.length, 3);
    assert.strictEqual(component.options[0].text, 'instructor group 2');
    assert.ok(component.options[0].isSelected);
    assert.strictEqual(component.options[1].text, 'instructor group 3');
    assert.notOk(component.options[1].isSelected);
    assert.strictEqual(component.options[2].text, 'instructor group 4');
    assert.notOk(component.options[2].isSelected);
  });

  test('changing school resets default value', async function (assert) {
    assert.expect(4);
    const schoolModels = await this.owner.lookup('service:store').findAll('school');
    this.set('school', schoolModels[0]);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(hbs`<Reports::Subject::New::InstructorGroup
  @currentId={{null}}
  @changeId={{noop}}
  @school={{this.school}}
/>`);

    assert.strictEqual(component.options[0].text, 'instructor group 0');
    this.set('school', schoolModels[1]);
    assert.strictEqual(component.options[0].text, 'instructor group 2');
    this.set('school', null);
    assert.strictEqual(component.options[0].text, 'instructor group 0');
    this.set('school', schoolModels[0]);
    assert.strictEqual(component.options[0].text, 'instructor group 0');
  });
});
