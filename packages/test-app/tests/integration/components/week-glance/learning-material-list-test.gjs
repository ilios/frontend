import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/week-glance/learning-material-list';
import createTypedLearningMaterialProxy from 'ilios-common/utils/create-typed-learning-material-proxy';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import LearningMaterialList from 'ilios-common/components/week-glance/learning-material-list';

module('Integration | Component | week-glance/learning-material-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    this.set('event', {});
    this.set('preworkEvents', [
      {
        name: 'prework 1',
        learningMaterials: [
          createTypedLearningMaterialProxy({
            id: 1,
            title: 'pre mat 1',
            sessionLearningMaterial: 13,
            citation: 'foobar',
          }),
          createTypedLearningMaterialProxy({
            id: 2,
            title: 'pre mat 2',
            sessionLearningMaterial: 13,
            link: 'https://iliosproject.org',
          }),
        ],
      },
    ]);
    this.set('sessionLearningMaterials', [
      createTypedLearningMaterialProxy({
        link: 'https://iliosproject.org',
        title: 'link lm',
      }),
      createTypedLearningMaterialProxy({
        title: 'citation lm',
        citation: 'Forever Sunshine',
      }),
    ]);
    await render(
      <template>
        <LearningMaterialList
          @event={{this.event}}
          @preworkEvents={{this.preworkEvents}}
          @learningMaterials={{this.sessionLearningMaterials}}
        />
      </template>,
    );
    assert.strictEqual(component.prework.length, 1);
    assert.strictEqual(component.prework[0].name, 'prework 1');
    assert.strictEqual(component.prework[0].materials.length, 2);
    assert.strictEqual(component.prework[0].materials[0].title, 'pre mat 1');
    assert.ok(component.prework[0].materials[0].typeIcon.isCitation);
    assert.strictEqual(component.prework[0].materials[1].title, 'pre mat 2');
    assert.ok(component.prework[0].materials[1].typeIcon.isLink);
    assert.strictEqual(component.materials.length, 2);
    assert.strictEqual(component.materials[0].title, 'link lm');
    assert.ok(component.materials[0].typeIcon.isLink);
    assert.strictEqual(component.materials[1].title, 'citation lm');
    assert.ok(component.materials[1].typeIcon.isCitation);
    assert.strictEqual(component.materials[1].citation, 'Forever Sunshine');
  });
});
