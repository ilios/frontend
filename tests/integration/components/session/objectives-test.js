import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session/objectives';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/objectives', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const course = this.server.create('course');
    const objectiveInCourse = this.server.create('objective');
    this.server.create('course-objective', { course, objective: objectiveInCourse });
    const session = this.server.create('session', { course });
    const objectiveInSession1 = this.server.create('objective');
    const objectiveInSession2 = this.server.create('objective');
    const objectiveInSession3 = this.server.create('objective', { parents: [ objectiveInCourse ]});
    this.server.create('session-objective', { session, objective: objectiveInSession1 });
    this.server.create('session-objective', { session, objective: objectiveInSession2 });
    this.server.create('session-objective', { session, objective: objectiveInSession3 });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`<Session::Objectives
      @session={{this.session}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.objectiveList.objectives.length, 3);
    assert.equal(component.objectiveList.objectives[0].description.text, 'objective 1');
    assert.ok(component.objectiveList.objectives[0].parents.empty);
    assert.ok(component.objectiveList.objectives[0].meshDescriptors.empty);

    assert.equal(component.objectiveList.objectives[1].description.text, 'objective 2');
    assert.ok(component.objectiveList.objectives[1].parents.empty);
    assert.ok(component.objectiveList.objectives[1].meshDescriptors.empty);

    assert.equal(component.objectiveList.objectives[2].description.text, 'objective 3');
    assert.equal(component.objectiveList.objectives[2].parents.list.length, 1);
    assert.equal(component.objectiveList.objectives[2].parents.list[0].text, 'objective 0');
    assert.ok(component.objectiveList.objectives[2].meshDescriptors.empty);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('deleting objective', async function (assert) {
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const objective = this.server.create('objective');
    this.server.create('session-objective', { session, objective });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`<Session::Objectives
      @session={{this.session}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.objectiveList.objectives.length, 1);
    assert.equal(component.title, 'Objectives (1)');
    await component.objectiveList.objectives[0].remove();
    await component.objectiveList.objectives[0].confirmRemoval.confirm();
    assert.equal(component.objectiveList.objectives.length, 0);
    assert.equal(component.title, 'Objectives (0)');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
