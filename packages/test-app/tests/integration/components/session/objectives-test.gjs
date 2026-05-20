import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/session/objectives';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMSW } from 'ilios-common/msw';
import Objectives from 'ilios-common/components/session/objectives';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | session/objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders and is accessible', async function (assert) {
    const course = await this.server.create('course');
    const courseObjective = await this.server.create('course-objective', { course });
    const session = await this.server.create('session', { course });
    await this.server.create('session-objective', { session });
    await this.server.create('session-objective', { session });
    await this.server.create('session-objective', {
      session,
      courseObjectives: [courseObjective],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(
      <template>
        <Objectives
          @session={{this.session}}
          @editable={{true}}
          @collapse={{(noop)}}
          @expand={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.objectiveList.objectives.length, 3);
    assert.strictEqual(
      component.objectiveList.objectives[0].description.text,
      'session objective 0',
    );
    assert.ok(component.objectiveList.objectives[0].parents.empty);
    assert.ok(component.objectiveList.objectives[0].meshDescriptors.empty);

    assert.strictEqual(
      component.objectiveList.objectives[1].description.text,
      'session objective 1',
    );
    assert.ok(component.objectiveList.objectives[1].parents.empty);
    assert.ok(component.objectiveList.objectives[1].meshDescriptors.empty);

    assert.strictEqual(
      component.objectiveList.objectives[2].description.text,
      'session objective 2',
    );
    assert.strictEqual(component.objectiveList.objectives[2].parents.list.length, 1);
    assert.strictEqual(
      component.objectiveList.objectives[2].parents.list[0].text,
      'course objective 0',
    );
    assert.ok(component.objectiveList.objectives[2].meshDescriptors.empty);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('deleting objective', async function (assert) {
    const course = await this.server.create('course');
    const session = await this.server.create('session', { course });
    await this.server.create('session-objective', { session });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(
      <template>
        <Objectives
          @session={{this.session}}
          @editable={{true}}
          @collapse={{(noop)}}
          @expand={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.objectiveList.objectives.length, 1);
    assert.strictEqual(component.title, 'Objectives (1)');
    await component.objectiveList.objectives[0].remove();
    await component.objectiveList.objectives[0].confirmRemoval.confirm();
    assert.strictEqual(component.objectiveList.objectives.length, 0);
    assert.strictEqual(component.title, 'Objectives (0)');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
