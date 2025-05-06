import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/session/manage-objective-parents';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import ManageObjectiveParents from 'ilios-common/components/session/manage-objective-parents';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | session/manage-objective-parents', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const course = this.server.create('course');
    this.server.create('course-objective', { course });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('courseObjectives', await courseModel.courseObjectives);
    this.set('courseTitle', course.title);
    await render(
      <template>
        <ManageObjectiveParents
          @courseTitle={{this.courseTitle}}
          @courseObjectives={{this.courseObjectives}}
          @selected={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.courseTitle, course.title);
    assert.strictEqual(component.objectives.length, 1);
    assert.strictEqual(component.objectives[0].title, 'course objective 0');
    assert.ok(component.objectives[0].notSelected);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('parent objectives are sorted correctly', async function (assert) {
    const course = this.server.create('course');
    this.server.create('course-objective', {
      title: 'Aardvark',
      position: 3,
      course,
    });
    this.server.create('course-objective', {
      title: 'Zeppelin',
      position: 2,
      course,
    });
    this.server.create('course-objective', {
      title: 'Oscar',
      position: 1,
      course,
    });
    const objectives = await this.owner.lookup('service:store').findAll('course-objective');
    this.set('courseObjectives', objectives);
    this.set('courseTitle', course.title);
    await render(
      <template>
        <ManageObjectiveParents
          @courseTitle={{this.courseTitle}}
          @courseObjectives={{this.courseObjectives}}
          @selected={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.objectives.length, 3);
    assert.strictEqual(component.objectives[0].title, 'Oscar');
    assert.strictEqual(component.objectives[1].title, 'Zeppelin');
    assert.strictEqual(component.objectives[2].title, 'Aardvark');
  });
});
