import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/school-competencies-expanded';

module('Integration | Component | school competencies expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const domain = this.server.create('competency', {
      school,
      title: 'domain 0',
    });
    this.server.create('competency', {
      school,
      title: 'competency 0',
      parent: domain,
    });
    this.server.create('competency', {
      school,
      title: 'competency 1',
      parent: domain,
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<SchoolCompetenciesExpanded
      @school={{this.school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setSchoolManageCompetencies={{(noop)}}
    />`);
    assert.equal(component.collapser.text, 'Competencies (1/2)');
    assert.equal(component.competenciesList.items.length, 3);
    assert.equal(component.competenciesList.items[0].title.text, 'domain 0');
    assert.equal(component.competenciesList.items[1].title.text, 'competency 0');
    assert.equal(component.competenciesList.items[2].title.text, 'competency 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
