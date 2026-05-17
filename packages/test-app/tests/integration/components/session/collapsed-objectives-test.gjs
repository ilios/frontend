import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/session/collapsed-objectives';
import { setupMSW } from 'ilios-common/msw';
import CollapsedObjectives from 'ilios-common/components/session/collapsed-objectives';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | session/collapsed-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const meshDescriptor = await this.server.create('mesh-descriptor');
    const term = await this.server.create('term');
    const courseObjective = await this.server.create('course-objective');
    this.objective = await this.server.create('session-objective');
    this.objectiveWithMesh = await this.server.create('session-objective', {
      meshDescriptors: [meshDescriptor],
    });
    this.objectiveWithTerms = await this.server.create('session-objective', {
      terms: [term],
    });
    this.objectiveWithCourseObjectives = await this.server.create('session-objective', {
      courseObjectives: [courseObjective],
    });
  });

  test('displays summary data', async function (assert) {
    const session = await this.server.create('session', {
      sessionObjectives: [
        this.objective,
        this.objectiveWithMesh,
        this.objectiveWithCourseObjectives,
        this.objectiveWithTerms,
      ],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(
      <template><CollapsedObjectives @session={{this.session}} @expand={{(noop)}} /></template>,
    );

    assert.strictEqual(component.title, 'Objectives (4)');
    assert.strictEqual(component.objectiveCount, 'There are 4 objectives');
    assert.strictEqual(component.parentCount, '1 has a parent');
    assert.strictEqual(component.meshCount, '1 has MeSH');
    assert.strictEqual(component.termCount, '1 has vocabulary terms');

    assert.ok(component.parentStatus.partial);
    assert.ok(component.meshStatus.partial);
    assert.ok(component.termStatus.partial);
  });

  test('clicking expand icon opens full view', async function (assert) {
    const session = await this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    this.set('click', () => {
      assert.step('click called');
    });
    await render(
      <template><CollapsedObjectives @session={{this.session}} @expand={{this.click}} /></template>,
    );

    assert.strictEqual(component.title, 'Objectives (0)');
    await component.expand();
    assert.verifySteps(['click called']);
  });

  test('icons all program year objectives correctly', async function (assert) {
    const session = await this.server.create('session', {
      sessionObjectives: [this.objectiveWithCourseObjectives],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(
      <template><CollapsedObjectives @session={{this.session}} @expand={{(noop)}} /></template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.complete);
  });

  test('icons no parents correctly', async function (assert) {
    const session = await this.server.create('session', {
      sessionObjectives: [this.objective],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(
      <template><CollapsedObjectives @session={{this.session}} @expand={{(noop)}} /></template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.none);
  });

  test('icons all mesh correctly', async function (assert) {
    const session = await this.server.create('session', {
      sessionObjectives: [this.objectiveWithMesh],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(
      <template><CollapsedObjectives @session={{this.session}} @expand={{(noop)}} /></template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.complete);
  });

  test('icons no mesh correctly', async function (assert) {
    const session = await this.server.create('session', {
      sessionObjectives: [this.objective],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(
      <template><CollapsedObjectives @session={{this.session}} @expand={{(noop)}} /></template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.none);
  });

  test('icons all terms correctly', async function (assert) {
    const session = await this.server.create('session', {
      sessionObjectives: [this.objectiveWithTerms],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(
      <template><CollapsedObjectives @session={{this.session}} @expand={{(noop)}} /></template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.termStatus.complete);
  });

  test('icons no terms correctly', async function (assert) {
    const session = await this.server.create('session', {
      sessionObjectives: [this.objective],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(
      <template><CollapsedObjectives @session={{this.session}} @expand={{(noop)}} /></template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.termStatus.none);
  });
});
