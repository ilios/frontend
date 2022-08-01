import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

import { component } from 'ilios-common/page-objects/components/week-glance/learning-material';

module('Integration | Component | week-glance/learning-material-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function (assert) {
    const lm = {
      title: 'lm 1',
      link: 'https://example.com',
      type: 'link',
    };
    this.set('lm', lm);
    this.set('event', {
      learningMaterials: [lm],
    });

    await render(hbs`<WeekGlance::LearningMaterialListItem
      @event={{this.event}}
      @lm={{this.lm}}
      @index={{1}}
      @showLink={{true}}
    />`);

    assert.strictEqual(component.title, 'lm 1');
    assert.ok(component.typeIcon.isLink);
    assert.ok(component.hasLink);
  });

  test('it renders without link by default', async function (assert) {
    const lm = {
      title: 'lm 1',
      link: 'https://example.com',
      type: 'link',
    };
    this.set('lm', lm);
    this.set('event', {
      learningMaterials: [lm],
    });

    await render(hbs`<WeekGlance::LearningMaterialListItem
      @event={{this.event}}
      @lm={{this.lm}}
      @index={{1}}
    />`);

    assert.notOk(component.hasLink);
  });

  test('it renders without link when showLink is false', async function (assert) {
    const lm = {
      title: 'lm 1',
      link: 'https://example.com',
      type: 'link',
    };
    this.set('lm', lm);
    this.set('event', {
      learningMaterials: [lm],
    });

    await render(hbs`<WeekGlance::LearningMaterialListItem
      @event={{this.event}}
      @lm={{this.lm}}
      @index={{1}}
      @showLink={{false}}
    />`);

    assert.notOk(component.hasLink);
  });
});
