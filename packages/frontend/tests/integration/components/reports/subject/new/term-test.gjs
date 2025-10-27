import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/term';
import Term from 'frontend/components/reports/subject/new/term';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/subject/new/term', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
    const [school1, school2] = this.server.createList('school', 2);
    const vocabulary1 = this.server.create('vocabulary', { school: school1 });
    const vocabulary2 = this.server.create('vocabulary', { school: school2, duration: 7 });
    const [parent1, parent2] = this.server.createList('term', 2, {
      active: true,
      vocabulary: vocabulary1,
    });
    const parent3 = this.server.create('term', {
      active: true,
      vocabulary: vocabulary1,
      parent: parent2,
    });
    this.server.create('term', {
      active: true,
      vocabulary: vocabulary1,
    });
    this.server.create('term', {
      active: true,
      vocabulary: vocabulary1,
      parent: parent1,
    });
    this.server.create('term', {
      active: true,
      vocabulary: vocabulary2,
    });
    this.server.create('term', {
      vocabulary: vocabulary1,
      active: true,
      parent: parent3,
    });
  });

  test('it renders', async function (assert) {
    this.set('currentId', null);
    await render(
      <template>
        <Term @currentId={{this.currentId}} @changeId={{(noop)}} @school={{null}} />
      </template>,
    );

    assert.strictEqual(component.options.length, 8);
    assert.strictEqual(component.options[0].text, this.intl.t('general.selectPolite'));
    assert.ok(component.options[0].isSelected);
    assert.strictEqual(component.value, '');

    assert.strictEqual(component.options[1].text, 'Vocabulary 1 > term 0');
    assert.notOk(component.options[1].isSelected);
    assert.strictEqual(component.options[2].text, 'Vocabulary 1 > term 0 > term 4');
    assert.notOk(component.options[2].isSelected);
    assert.strictEqual(component.options[3].text, 'Vocabulary 1 > term 1');
    assert.notOk(component.options[3].isSelected);
    assert.strictEqual(component.options[4].text, 'Vocabulary 1 > term 1 > term 2');
    assert.notOk(component.options[4].isSelected);
    assert.strictEqual(component.options[5].text, 'Vocabulary 1 > term 1 > term 2 > term 6');
    assert.notOk(component.options[5].isSelected);
    assert.strictEqual(component.options[6].text, 'Vocabulary 1 > term 3');
    assert.notOk(component.options[6].isSelected);
    assert.strictEqual(component.options[7].text, 'Vocabulary 2 > term 5');
    assert.notOk(component.options[7].isSelected);

    this.set('currentId', '3');
    assert.notOk(component.options[0].isSelected);
    assert.ok(component.options[4].isSelected);
    assert.strictEqual(component.value, '3');
  });

  test('it works', async function (assert) {
    this.set('currentId', '3');
    this.set('changeId', (id) => {
      assert.step('changeId called');
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(
      <template>
        <Term @currentId={{this.currentId}} @changeId={{this.changeId}} @school={{null}} />
      </template>,
    );
    assert.ok(component.options[4].isSelected);
    await component.set('1');
    assert.notOk(component.options[4].isSelected);
    assert.ok(component.options[1].isSelected);
    assert.strictEqual(component.value, '1');
    assert.verifySteps(['changeId called']);
  });

  test('it filters by school', async function (assert) {
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', 2);
    this.set('currentId', null);
    this.set('school', schoolModel);
    await render(
      <template>
        <Term @currentId={{this.currentId}} @changeId={{(noop)}} @school={{this.school}} />
      </template>,
    );

    assert.strictEqual(component.options.length, 2);
    assert.strictEqual(component.options[0].text, this.intl.t('general.selectPolite'));
    assert.strictEqual(component.options[1].text, 'Vocabulary 2 > term 5');
  });

  test('changing school resets default value', async function (assert) {
    const schoolModels = await this.owner.lookup('service:store').findAll('school');
    this.set('school', schoolModels[0]);
    await render(
      <template>
        <Term @currentId={{null}} @changeId={{(noop)}} @school={{this.school}} />
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
