import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session/objective-list-item';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/objective-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const session = this.server.create('session', { course });
    const sessionObjective = this.server.create('session-objective', {
      session,
    });
    const store = await this.owner.lookup('service:store');
    const sessionModel = await store.findRecord('session', session.id);
    const sessionObjectiveModel = await store.findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('sessionModel', sessionModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{(array)}}
        @session={{this.sessionModel}}
      />
`,
    );
    assert.notOk(component.hasRemoveConfirmation);
    assert.strictEqual(component.description.text, 'session objective 0');
    assert.strictEqual(component.parents.text, 'Add New');
    assert.strictEqual(component.meshDescriptors.text, 'Add New');
    assert.ok(component.hasTrashCan);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('can change title', async function (assert) {
    const session = this.server.create('session');
    const sessionObjective = this.server.create('session-objective', {
      session,
    });
    const store = await this.owner.lookup('service:store');
    const sessionModel = await store.findRecord('session', session.id);
    const sessionObjectiveModel = await store.findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('sessionModel', sessionModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{(array)}}
        @session={{this.sessionModel}}
      />
`,
    );
    const newDescription = 'Pluto Visits Earth';
    assert.strictEqual(component.description.text, 'session objective 0');
    await component.description.openEditor();
    await component.description.edit(newDescription);
    await component.description.save();
    assert.strictEqual(component.description.text, newDescription);
  });

  test('can manage parents', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const session = this.server.create('session', { course });
    const sessionObjective = this.server.create('session-objective', {
      session,
    });
    const store = await this.owner.lookup('service:store');
    const sessionModel = await store.findRecord('session', session.id);
    const sessionObjectiveModel = await store.findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('sessionModel', sessionModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{(array)}}
        @session={{this.sessionModel}}
      />
`,
    );
    await component.parents.list[0].manage();
    assert.ok(component.parentManager.isPresent);
  });

  test('can manage descriptors', async function (assert) {
    const session = this.server.create('session');
    const sessionObjective = this.server.create('session-objective', {
      session,
    });
    const store = await this.owner.lookup('service:store');
    const sessionModel = await store.findRecord('session', session.id);
    const sessionObjectiveModel = await store.findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('sessionModel', sessionModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{(array)}}
        @session={{this.sessionModel}}
      />
`,
    );
    await component.meshDescriptors.list[0].manage();
    assert.ok(component.meshManager.isPresent);
  });

  test('can manage terms', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const session = this.server.create('session', { course });
    const sessionObjective = this.server.create('session-objective', {
      session,
    });
    const store = await this.owner.lookup('service:store');
    const sessionModel = await store.findRecord('session', session.id);
    const sessionObjectiveModel = await store.findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('sessionModel', sessionModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{(array)}}
        @session={{this.sessionModel}}
      />
`,
    );
    assert.notOk(component.taxonomyManager.isPresent);
    await component.selectedTerms.manage();
    assert.ok(component.taxonomyManager.isPresent);
  });

  test('can trigger removal', async function (assert) {
    const session = this.server.create('session');
    const sessionObjective = this.server.create('session-objective', {
      session,
    });
    const store = await this.owner.lookup('service:store');
    const sessionModel = await store.findRecord('session', session.id);
    const sessionObjectiveModel = await store.findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('sessionModel', sessionModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{(array)}}
        @session={{this.sessionModel}}
      />
`,
    );
    await component.remove();
    assert.ok(component.hasRemoveConfirmation);
  });
});
