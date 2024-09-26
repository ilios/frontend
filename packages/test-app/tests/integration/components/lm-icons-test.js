import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/lm-icons';
import createTypedLearningMaterialProxy from 'ilios-common/utils/create-typed-learning-material-proxy';

module('Integration | Component | lm-icons', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders optional', async function (assert) {
    this.set('lm', createTypedLearningMaterialProxy({ link: 'https://iliosproject.org' }));
    await render(hbs`<LmIcons @learningMaterial={{this.lm}} />`);
    assert.ok(component.type.isLink);
    assert.notOk(component.isRequired);
  });

  test('it renders required', async function (assert) {
    this.set('lm', createTypedLearningMaterialProxy({ citation: 'Lorem Ipsum', required: true }));
    await render(hbs`<LmIcons @learningMaterial={{this.lm}} />`);
    assert.ok(component.type.isCitation);
    assert.ok(component.isRequired);
  });
});
