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
        isPublished: true,
        learningMaterials: [
          createTypedLearningMaterialProxy({
            id: 1,
            title: 'pre mat 1',
            sessionLearningMaterial: 13,
            citation: 'foobar 1',
          }),
          createTypedLearningMaterialProxy({
            id: 2,
            title: 'pre mat 2',
            sessionLearningMaterial: 13,
            link: 'https://iliosproject.org',
          }),
        ],
      },
      {
        name: 'prework 2',
        isPublished: false,
        learningMaterials: [
          createTypedLearningMaterialProxy({
            id: 1,
            title: 'pre mat 1',
            sessionLearningMaterial: 13,
            citation: 'foobar 2',
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

    assert.strictEqual(component.prework.length, 2, 'number of prework items is correct');

    assert.strictEqual(component.prework[0].name, 'prework 1', 'first prework name is correct');
    assert.notOk(component.prework[0].isUnPublished, 'first prework is published');
    assert.strictEqual(
      component.prework[0].materials.length,
      2,
      'first prework materials length is correct',
    );
    assert.strictEqual(
      component.prework[0].materials[0].title,
      'pre mat 1',
      'first prework material name is correct',
    );
    assert.ok(
      component.prework[0].materials[0].typeIcon.isCitation,
      'first prework material icon is correct',
    );
    assert.strictEqual(
      component.prework[0].materials[1].title,
      'pre mat 2',
      'first prework, first material name is correct',
    );
    assert.ok(
      component.prework[0].materials[1].typeIcon.isLink,
      'first prework, first material icon is correct',
    );

    assert.strictEqual(component.prework[1].name, 'prework 2', 'second prework name is correct');
    assert.ok(component.prework[1].isUnPublished);
    assert.strictEqual(
      component.prework[1].materials.length,
      2,
      'second prework materials count is correct',
    );
    assert.strictEqual(
      component.prework[1].materials[0].title,
      'pre mat 1',
      'second prework, first material title is correct',
    );
    assert.ok(
      component.prework[1].materials[0].typeIcon.isCitation,
      'second prework, first material icon is correct',
    );
    assert.strictEqual(
      component.prework[1].materials[1].title,
      'pre mat 2',
      'second prework, second material title is correct',
    );
    assert.ok(
      component.prework[1].materials[1].typeIcon.isLink,
      'second prework, second material icon is correct',
    );

    assert.strictEqual(component.materials.length, 2, 'number of materials is correct');
    assert.strictEqual(component.materials[0].title, 'link lm', 'first material title is correct');
    assert.ok(component.materials[0].typeIcon.isLink, 'first material has correct icon');
    assert.strictEqual(
      component.materials[1].title,
      'citation lm',
      'second material has correct title',
    );
    assert.ok(component.materials[1].typeIcon.isCitation, 'second material has correct icon');
    assert.strictEqual(
      component.materials[1].citation,
      'Forever Sunshine',
      'second material has correct citation',
    );
  });
});
