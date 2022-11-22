import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { component } from 'ilios-common/page-objects/components/week-glance/learning-material-list';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | week-glance/learning-material-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    this.set('event', {});
    this.set('preworkEvents', [
      {
        name: 'prework 1',
        learningMaterials: [
          {
            id: 1,
            title: 'pre mat 1',
            sessionLearningMaterial: 13,
          },
          {
            id: 2,
            title: 'pre mat 2',
            sessionLearningMaterial: 13,
          },
        ],
      },
    ]);
    this.set('sessionLearningMaterials', [
      {
        type: 'link',
        title: 'link lm',
      },
      {
        type: 'citation',
        title: 'citation lm',
        citation: 'Forever Sunshine',
      },
    ]);
    await render(hbs`<WeekGlance::LearningMaterialList
      @event={{this.event}}
      @preworkEvents={{this.preworkEvents}}
      @learningMaterials={{this.sessionLearningMaterials}}
    />
`);

    assert.strictEqual(component.prework.length, 1);
    assert.strictEqual(component.prework[0].name, 'prework 1');
    assert.strictEqual(component.prework[0].materials.length, 2);
    assert.strictEqual(component.prework[0].materials[0].title, 'pre mat 1');
    assert.strictEqual(component.prework[0].materials[1].title, 'pre mat 2');
    assert.strictEqual(component.materials.length, 2);
    assert.strictEqual(component.materials[0].title, 'link lm');
    assert.strictEqual(component.materials[1].title, 'citation lm');
    assert.strictEqual(component.materials[1].citation, 'Forever Sunshine');
  });
});
