import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/collapsed-taxonomies';

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
    const sessionModel = await this.owner.lookup('service:store').find('session', this.session.id);

    this.set('subject', sessionModel);
    this.set('click', () => {});
    await render(hbs`<CollapsedTaxonomies @subject={{this.subject}} @expand={{this.click}} />`);
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
    assert.expect(2);
    const sessionModel = await this.owner.lookup('service:store').find('session', this.session.id);

    this.set('subject', sessionModel);
    this.set('click', () => {
      assert.ok(true);
    });
    await render(hbs`<CollapsedTaxonomies @subject={{this.subject}} @expand={{this.click}} />`);
    assert.strictEqual(component.title, 'Terms (1)');
    await component.expand();
  });
});
