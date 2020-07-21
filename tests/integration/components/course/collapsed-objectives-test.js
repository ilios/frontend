import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/course/collapsed-objectives';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/collapsed-objectives', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const meshDescriptor = this.server.create('mesh-descriptor');
    const programYearObjective = this.server.create('program-year-objective');
    this.objective = this.server.create('course-objective');
    this.objectiveWithMesh = this.server.create('course-objective', { meshDescriptors: [ meshDescriptor ]});
    this.objectiveWithProgramYearObjectives = this.server.create('course-objective', {
      programYearObjectives: [ programYearObjective ]
    });
  });

  test('displays summary data', async function(assert) {
    const course = this.server.create('course', {
      courseObjectives: [ this.objective, this.objectiveWithMesh, this.objectiveWithProgramYearObjectives ]
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::CollapsedObjectives @course={{this.course}} @expand={{noop}} />`);

    assert.equal(component.title, 'Objectives (3)');
    assert.equal(component.objectiveCount, 'There are 3 objectives');
    assert.equal(component.parentCount, '1 has a parent');
    assert.equal(component.meshCount, '1 has MeSH');
    assert.ok(component.parentStatus.partial);
    assert.ok(component.meshStatus.partial);
  });

  test('clicking expand icon opens full view', async function(assert) {
    assert.expect(2);

    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(true);
    });
    await render(hbs`<Course::CollapsedObjectives @course={{this.course}} @expand={{this.click}} />`);

    assert.equal(component.title, 'Objectives (0)');
    await component.expand();
  });

  test('icons all program year objectives correctly', async function(assert) {

    const course = this.server.create('course', { courseObjectives: [ this.objectiveWithProgramYearObjectives ]});
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::CollapsedObjectives @course={{this.course}} @expand={{noop}} />`);
    assert.equal(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.complete);
  });

  test('icons no parents correctly', async function(assert) {
    const course = this.server.create('course', { courseObjectives: [ this.objective ]});
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::CollapsedObjectives @course={{this.course}} @expand={{noop}} />`);
    assert.equal(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.none);
  });

  test('icons all mesh correctly', async function(assert) {
    const course = this.server.create('course', { courseObjectives: [ this.objectiveWithMesh ]});
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::CollapsedObjectives @course={{this.course}} @expand={{noop}} />`);
    assert.equal(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.complete);
  });

  test('icons no mesh correctly', async function(assert) {
    const course = this.server.create('course', { courseObjectives: [ this.objective ]});
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::CollapsedObjectives @course={{this.course}} @expand={{noop}} />`);
    assert.equal(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.none);
  });
});
