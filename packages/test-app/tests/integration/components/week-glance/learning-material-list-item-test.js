import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/week-glance/learning-material';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import createTypedLearningMaterialProxy from 'ilios-common/utils/create-typed-learning-material-proxy';

module('Integration | Component | week-glance/learning-material-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

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

    await render(hbs`<WeekGlance::LearningMaterialListItem
      @event={{this.event}}
      @lm={{this.lm}}
      @index={{1}}
      @showLink={{true}}
    />
`);

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

    await render(hbs`<WeekGlance::LearningMaterialListItem
      @event={{this.event}}
      @lm={{this.lm}}
      @index={{1}}
    />
`);

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

    await render(hbs`<WeekGlance::LearningMaterialListItem
      @event={{this.event}}
      @lm={{this.lm}}
      @index={{1}}
      @showLink={{false}}
    />
`);
    assert.notOk(component.hasLink);
  });
});
