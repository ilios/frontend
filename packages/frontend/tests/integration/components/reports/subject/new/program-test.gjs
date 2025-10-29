import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/program';
import Program from 'frontend/components/reports/subject/new/program';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/subject/new/program', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
    const [school1, school2] = this.server.createList('school', 2);
    this.server.createList('program', 2, { school: school1 });
    this.server.createList('program', 3, { school: school2 });
  });

  test('it renders', async function (assert) {
    this.set('currentId', null);
    await render(
      <template>
        <Program @currentId={{this.currentId}} @changeId={{(noop)}} @school={{null}} />
      </template>,
    );

    assert.strictEqual(component.options.length, 6);
    assert.strictEqual(component.options[0].text, this.intl.t('general.selectPolite'));
    assert.ok(component.options[0].isSelected);
    assert.strictEqual(component.value, '');

    for (let i = 1; i < 6; i++) {
      assert.strictEqual(component.options[i].text, `program ${i - 1}`);
      assert.notOk(component.options[i].isSelected);
    }

    this.set('currentId', '3');
    assert.notOk(component.options[0].isSelected);
    assert.ok(component.options[3].isSelected);
    assert.strictEqual(component.value, '3');
  });

  test('it works', async function (assert) {
    this.set('currentId', '1');
    this.set('changeId', (id) => {
      assert.step('changeId called');
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });

    await render(
      <template>
        <Program @currentId={{this.currentId}} @changeId={{this.changeId}} @school={{null}} />
      </template>,
    );
    assert.ok(component.options[1].isSelected);
    await component.set('3');
    assert.notOk(component.options[0].isSelected);
    assert.ok(component.options[3].isSelected);
    assert.strictEqual(component.value, '3');
    assert.verifySteps(['changeId called']);
  });

  test('it filters by school', async function (assert) {
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', 2);
    this.set('currentId', null);
    this.set('school', schoolModel);

    await render(
      <template>
        <Program @currentId={{this.currentId}} @changeId={{(noop)}} @school={{this.school}} />
      </template>,
    );

    assert.strictEqual(component.options.length, 4);
    assert.strictEqual(component.options[0].text, this.intl.t('general.selectPolite'));
    assert.ok(component.options[0].isSelected);
    assert.strictEqual(component.options[1].text, 'program 2');
    assert.notOk(component.options[1].isSelected);
    assert.strictEqual(component.options[2].text, 'program 3');
    assert.notOk(component.options[2].isSelected);
    assert.strictEqual(component.options[3].text, 'program 4');
    assert.notOk(component.options[3].isSelected);
  });

  test('changing school resets default value', async function (assert) {
    const schoolModels = await this.owner.lookup('service:store').findAll('school');
    this.set('school', schoolModels[0]);
    await render(
      <template>
        <Program @currentId={{null}} @changeId={{(noop)}} @school={{this.school}} />
      </template>,
    );

    assert.strictEqual(component.options[0].text, this.intl.t('general.selectPolite'));
    this.set('school', schoolModels[1]);
    assert.strictEqual(component.options[0].text, this.intl.t('general.selectPolite'));
    this.set('school', null);
    assert.strictEqual(component.options[0].text, this.intl.t('general.selectPolite'));
    this.set('school', schoolModels[0]);
    assert.strictEqual(component.options[0].text, this.intl.t('general.selectPolite'));
  });
});
