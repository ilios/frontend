import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session/manage-objective-parents';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/manage-objective-parents', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const course = this.server.create('course');
    this.server.create('objective', {
      courses: [course],
    });
    const session = this.server.create('session', {
      course
    });
    const objective = this.server.create('objective', {
      sessions: [session],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('objective', objectiveModel);
    this.set('courseObjectives', await courseModel.sortedObjectives);
    this.set('courseTitle', course.title);
    await render(hbs`<Session::ManageObjectiveParents
      @objective={{this.objective}}
      @courseTitle={{this.courseTitle}}
      @courseObjectives={{this.courseObjectives}}
      @selected={{array}}
      @add={{noop}}
      @remove={{noop}}
    />`);

    assert.equal(component.courseTitle, course.title);
    assert.equal(component.objectives.length, 1);
    assert.equal(component.objectives[0].title, 'objective 0');
    assert.ok(component.objectives[0].notSelected);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
