import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/competency-title-editor';

module('Integration | Component | competency title editor', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('validation errors do not show up initially', async function (assert) {
    const competency = this.server.create('competency', { title: 'test' });
    const competencyModel = await this.owner
      .lookup('service:store')
      .find('competency', competency.id);
    this.set('competency', competencyModel);
    await render(
      hbs`<CompetencyTitleEditor @competency={{this.competency}} @canUpdate={{true}} />`
    );
    assert.notOk(component.hasError);
  });

  test('validation errors show up when blank', async function (assert) {
    const competency = this.server.create('competency', { title: 'test' });
    const competencyModel = await this.owner
      .lookup('service:store')
      .find('competency', competency.id);
    this.set('competency', competencyModel);
    await render(
      hbs`<CompetencyTitleEditor @competency={{this.competency}} @canUpdate={{true}} />`
    );
    await component.title.edit();
    await component.title.set('');
    await component.title.save();
    assert.ok(component.hasError);
  });

  test('validation errors show up when too long', async function (assert) {
    const competency = this.server.create('competency', { title: 'test' });
    const competencyModel = await this.owner
      .lookup('service:store')
      .find('competency', competency.id);
    this.set('competency', competencyModel);
    await render(
      hbs`<CompetencyTitleEditor @competency={{this.competency}} @canUpdate={{true}} />`
    );
    await component.title.edit();
    await component.title.set('tooLong'.repeat(50));
    await component.title.save();
    assert.ok(component.hasError);
  });
});
