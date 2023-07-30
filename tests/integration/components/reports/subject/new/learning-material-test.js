import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/new/learning-material';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | reports/subject/new/learning-material', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.server.createList('learning-material', 5);
  });

  test('it renders', async function (assert) {
    assert.expect(16);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::LearningMaterial
      @currentId={{this.currentId}}
      @changeId={{this.changeId}}
      @school={{null}}
     />`);

    assert.strictEqual(component.options.length, 5);
    assert.strictEqual(component.options[0].text, 'learning material 0');
    assert.ok(component.options[0].isSelected);
    assert.strictEqual(component.value, '1');

    for (let i = 1; i < 5; i++) {
      assert.strictEqual(component.options[i].text, `learning material ${i}`);
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
    await render(hbs`<Reports::Subject::New::LearningMaterial
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
});
