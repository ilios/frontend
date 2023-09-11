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
    assert.expect(12);
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

    await component.input('material');
    await component.search();

    assert.strictEqual(component.results.length, 5);
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(component.results[i].text, `learning material ${i}`);
      assert.notOk(component.results[i].isSelected);
    }

    this.set('currentId', '3');
    assert.ok(component.results[2].isSelected);
  });

  test('it works', async function (assert) {
    assert.expect(2);
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

    await component.input('material');
    await component.search();

    await component.results[2].click();
    assert.ok(component.results[2].isSelected);
  });
});
