import { render } from '@ember/test-helpers';
import LearningMaterialListItem from 'frontend/components/week-glance/learning-material-list-item';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMSW } from 'frontend/tests/msw';
import { component } from 'frontend/tests/pages/components/week-glance/learning-material';
import createTypedLearningMaterialProxy from 'frontend/utils/create-typed-learning-material-proxy';
import { module, test } from 'qunit';

module('Integration | Component | week-glance/learning-material-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const lm = {
      title: 'lm 1',
      link: 'https://example.com',
    };
    const proxy = createTypedLearningMaterialProxy(lm);
    this.set('lm', proxy);
    this.set('event', {
      learningMaterials: [lm],
    });

    await render(
      <template>
        <LearningMaterialListItem
          @event={{this.event}}
          @lm={{this.lm}}
          @index={{1}}
          @showLink={{true}}
        />
      </template>,
    );

    assert.strictEqual(component.title, 'lm 1');
    assert.ok(component.typeIcon.isLink);
    assert.ok(component.hasLink);
  });

  test('it renders without link by default', async function (assert) {
    const lm = {
      title: 'lm 1',
      link: 'https://example.com',
    };
    const proxy = createTypedLearningMaterialProxy(lm);
    this.set('lm', proxy);
    this.set('event', {
      learningMaterials: [lm],
    });

    await render(
      <template>
        <LearningMaterialListItem @event={{this.event}} @lm={{this.lm}} @index={{1}} />
      </template>,
    );

    assert.notOk(component.hasLink);
  });

  test('it renders without link when showLink is false', async function (assert) {
    const lm = {
      title: 'lm 1',
      link: 'https://example.com',
    };
    const proxy = createTypedLearningMaterialProxy(lm);
    this.set('lm', proxy);
    this.set('event', {
      learningMaterials: [lm],
    });

    await render(
      <template>
        <LearningMaterialListItem
          @event={{this.event}}
          @lm={{this.lm}}
          @index={{1}}
          @showLink={{false}}
        />
      </template>,
    );
    assert.notOk(component.hasLink);
  });
});
