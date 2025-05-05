import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/learning-material';
import LearningMaterial from 'frontend/components/reports/subject/new/learning-material';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/subject/new/learning-material', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.createList('learning-material', 5);
  });

  test('it renders', async function (assert) {
    assert.expect(7);
    await render(
      <template>
        <LearningMaterial @currentId={{null}} @changeId={{(noop)}} @school={{null}} />
      </template>,
    );

    await component.input('material');
    assert.strictEqual(component.results.length, 5);
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(component.results[i].text, `learning material ${i}`);
    }
    assert.notOk(component.hasSelectedMaterial);
  });

  test('it renders with selected material', async function (assert) {
    assert.expect(2);
    await render(
      <template>
        <LearningMaterial @currentId={{2}} @changeId={{(noop)}} @school={{null}} />
      </template>,
    );
    assert.ok(component.hasSelectedMaterial);
    assert.strictEqual(component.selectedMaterial, 'learning material 1');
  });

  test('it works', async function (assert) {
    assert.expect(4);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });
    await render(
      <template>
        <LearningMaterial
          @currentId={{this.currentId}}
          @changeId={{this.changeId}}
          @school={{null}}
        />
      </template>,
    );
    assert.notOk(component.hasSelectedMaterial);
    await component.input('material');
    await component.results[2].click();
    assert.ok(component.hasSelectedMaterial);
    assert.strictEqual(component.selectedMaterial, 'learning material 2');
  });
});
