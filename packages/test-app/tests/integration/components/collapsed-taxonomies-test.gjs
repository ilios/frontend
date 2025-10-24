import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/collapsed-taxonomies';
import CollapsedTaxonomies from 'ilios-common/components/collapsed-taxonomies';

module('Integration | Component | collapsed taxonomies', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', {
      school,
      active: true,
    });
    const term1 = this.server.create('term', {
      vocabulary,
      active: true,
    });
    this.server.create('term', {
      vocabulary,
      active: true,
    });

    const course = this.server.create('course', {
      year: 2013,
      school,
    });
    this.session = this.server.create('session', {
      course,
      terms: [term1],
    });
  });

  test('it renders', async function (assert) {
    const sessionModel = await this.owner
      .lookup('service:store')
      .findRecord('session', this.session.id);

    this.set('subject', sessionModel);
    this.set('click', () => {});
    await render(
      <template><CollapsedTaxonomies @subject={{this.subject}} @expand={{this.click}} /></template>,
    );
    assert.strictEqual(component.title, 'Terms (1)');
    assert.strictEqual(component.headers.length, 3);
    assert.strictEqual(component.headers[0].title, 'Vocabulary');
    assert.strictEqual(component.headers[1].title, 'School');
    assert.strictEqual(component.headers[2].title, 'Assigned Terms');

    assert.strictEqual(component.vocabularies.length, 1);
    assert.strictEqual(component.vocabularies[0].name, 'Vocabulary 1');
    assert.strictEqual(component.vocabularies[0].school, 'school 0');
    assert.strictEqual(component.vocabularies[0].terms.length, 1);
  });

  test('click expands', async function (assert) {
    const sessionModel = await this.owner
      .lookup('service:store')
      .findRecord('session', this.session.id);

    this.set('subject', sessionModel);
    this.set('click', () => {
      assert.step('click called');
    });
    await render(
      <template><CollapsedTaxonomies @subject={{this.subject}} @expand={{this.click}} /></template>,
    );
    assert.strictEqual(component.title, 'Terms (1)');
    await component.expand();
    assert.verifySteps(['click called']);
  });
});
