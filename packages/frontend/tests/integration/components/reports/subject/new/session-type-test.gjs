import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/session-type';
import SessionType from 'frontend/components/reports/subject/new/session-type';

module('Integration | Component | reports/subject/new/session-type', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
    const [school1, school2] = this.server.createList('school', 2);
    this.server.createList('session-type', 2, { active: true, school: school1 });
    this.server.createList('session-type', 3, { active: true, school: school2 });
  });

  test('it renders', async function (assert) {
    assert.expect(15);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(
      <template>
        <SessionType @currentId={{this.currentId}} @changeId={{this.changeId}} @school={{null}} />
      </template>,
    );

    assert.strictEqual(component.options.length, 6, 'options count is correct');
    assert.strictEqual(
      component.options[0].text,
      this.intl.t('general.selectPolite'),
      'options default text is correct',
    );
    assert.ok(component.options[0].isSelected, 'options default option is selected');
    assert.strictEqual(component.value, '', 'selected option value is correct');

    for (let i = 1; i < 5; i++) {
      assert.strictEqual(
        component.options[i].text,
        `school ${i < 3 ? 0 : 1}: session type ${i - 1}`,
        `option ${i} text is correct`,
      );
      assert.notOk(component.options[i].isSelected, 'option is not selected');
    }

    this.set('currentId', '3');
    assert.notOk(component.options[0].isSelected, 'first option is not selected');
    assert.ok(component.options[3].isSelected, 'fourth option is selected');
    assert.strictEqual(component.value, '3', 'option value is correct');
  });

  test('it works', async function (assert) {
    assert.expect(5);
    this.set('currentId', '1');
    await render(
      <template>
        <SessionType @currentId={{this.currentId}} @changeId={{this.changeId}} @school={{null}} />
      </template>,
    );
    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });
    assert.ok(component.options[1].isSelected);
    await component.set('3');
    assert.notOk(component.options[1].isSelected);
    assert.ok(component.options[3].isSelected);
    assert.strictEqual(component.value, '3');
  });

  test('it filters by school', async function (assert) {
    assert.expect(9);
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', 2);
    this.set('currentId', null);
    this.set('school', schoolModel);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });
    await render(
      <template>
        <SessionType
          @currentId={{this.currentId}}
          @changeId={{this.changeId}}
          @school={{this.school}}
        />
      </template>,
    );

    assert.strictEqual(component.options.length, 4);
    assert.strictEqual(component.options[0].text, this.intl.t('general.selectPolite'));
    assert.ok(component.options[0].isSelected);
    assert.strictEqual(component.options[1].text, 'session type 2');
    assert.notOk(component.options[1].isSelected);
    assert.strictEqual(component.options[2].text, 'session type 3');
    assert.notOk(component.options[2].isSelected);
    assert.strictEqual(component.options[3].text, 'session type 4');
    assert.notOk(component.options[3].isSelected);
  });

  test('changing school resets default value', async function (assert) {
    assert.expect(4);
    const schoolModels = await this.owner.lookup('service:store').findAll('school');
    this.set('school', schoolModels[0]);
    await render(
      <template>
        <SessionType @currentId={{null}} @changeId={{this.changeId}} @school={{this.school}} />
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
