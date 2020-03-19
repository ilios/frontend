import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/manage-objective-competency';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/manage-objective-competency', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const course = this.server.create('course');
    const objective = this.server.create('objective', {
      courses: [course],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);

    const domains = [
      {
        title: 'domain 0',
        id: 1,
        competencies: [
          {
            id: 2,
            title: 'competency 0',
          }
        ]
      }
    ];
    this.set('objectiveTitle', objectiveModel.title);
    this.set('domains', domains);
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @objectiveTitle={{this.objectiveTitle}}
      @domains={{this.domains}}
      @selected={{null}}
      @add={{noop}}
      @remove={{noop}}
    />`);

    assert.equal(component.objectiveTitle, objectiveModel.title);

    assert.equal(component.domains.length, 1);
    assert.equal(component.domains[0].title, 'domain 0');
    assert.ok(component.domains[0].notSelected);

    assert.equal(component.domains[0].competencies.length, 1);
    assert.equal(component.domains[0].competencies[0].title, 'competency 0');
    assert.ok(component.domains[0].competencies[0].notSelected);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
