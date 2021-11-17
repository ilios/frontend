import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/session/collapsed-objectives';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/collapsed-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const meshDescriptor = this.server.create('mesh-descriptor');
    const term = this.server.create('term');
    const courseObjective = this.server.create('course-objective');
    this.objective = this.server.create('session-objective');
    this.objectiveWithMesh = this.server.create('session-objective', {
      meshDescriptors: [meshDescriptor],
    });
    this.objectiveWithTerms = this.server.create('session-objective', {
      terms: [term],
    });
    this.objectiveWithCourseObjectives = this.server.create('session-objective', {
      courseObjectives: [courseObjective],
    });
  });

  test('displays summary data', async function (assert) {
    const session = this.server.create('session', {
      sessionObjectives: [
        this.objective,
        this.objectiveWithMesh,
        this.objectiveWithCourseObjectives,
        this.objectiveWithTerms,
      ],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`
      <Session::CollapsedObjectives
        @session={{this.session}}
        @expand={{(noop)}}
      />
    `);

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
    assert.expect(2);

    const session = this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    this.set('click', () => {
      assert.ok(true);
    });
    await render(
      hbs`<Session::CollapsedObjectives @session={{this.session}} @expand={{this.click}} />`
    );

    assert.strictEqual(component.title, 'Objectives (0)');
    await component.expand();
  });

  test('icons all program year objectives correctly', async function (assert) {
    const session = this.server.create('session', {
      sessionObjectives: [this.objectiveWithCourseObjectives],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`
      <Session::CollapsedObjectives
        @session={{this.session}}
        @expand={{(noop)}}
      />
    `);
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.complete);
  });

  test('icons no parents correctly', async function (assert) {
    const session = this.server.create('session', {
      sessionObjectives: [this.objective],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`
      <Session::CollapsedObjectives
        @session={{this.session}}
        @expand={{(noop)}}
      />
    `);
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.none);
  });

  test('icons all mesh correctly', async function (assert) {
    const session = this.server.create('session', {
      sessionObjectives: [this.objectiveWithMesh],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`
      <Session::CollapsedObjectives
        @session={{this.session}}
        @expand={{(noop)}}
      />
    `);
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.complete);
  });

  test('icons no mesh correctly', async function (assert) {
    const session = this.server.create('session', {
      sessionObjectives: [this.objective],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`
      <Session::CollapsedObjectives
        @session={{this.session}}
        @expand={{(noop)}}
      />
    `);
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.none);
  });

  test('icons all terms correctly', async function (assert) {
    const session = this.server.create('session', {
      sessionObjectives: [this.objectiveWithTerms],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`
      <Session::CollapsedObjectives
        @session={{this.session}}
        @expand={{(noop)}}
      />
    `);
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.termStatus.complete);
  });

  test('icons no terms correctly', async function (assert) {
    const session = this.server.create('session', {
      sessionObjectives: [this.objective],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`
      <Session::CollapsedObjectives
        @session={{this.session}}
        @expand={{(noop)}}
      />
    `);
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.termStatus.none);
  });
});
