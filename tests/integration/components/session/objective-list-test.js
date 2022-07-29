import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session/objective-list';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/objective-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    assert.expect(14);
    const school = this.server.create('school');
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const vocabulary = this.server.create('vocabulary', { school });
    const term1 = this.server.create('term', { vocabulary });
    const term2 = this.server.create('term', { vocabulary });
    this.server.create('sessionObjective', {
      session,
      title: 'Objective A',
      position: 0,
      terms: [term1],
    });
    this.server.create('sessionObjective', {
      session,
      title: 'Objective B',
      position: 0,
      terms: [term2],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);

    await render(
      hbs`<Session::ObjectiveList
        @editable={{true}}
        @session={{this.session}}
      />`
    );
    assert.ok(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.strictEqual(component.headers[0].text, 'Description');
    assert.strictEqual(component.headers[1].text, 'Parent Objectives');
    assert.strictEqual(component.headers[2].text, 'Vocabulary Terms');
    assert.strictEqual(component.headers[3].text, 'MeSH Terms');
    assert.strictEqual(component.headers[4].text, 'Actions');

    assert.strictEqual(component.objectives.length, 2);
    assert.strictEqual(component.objectives[0].description.text, 'Objective B');
    assert.strictEqual(
      component.objectives[0].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)'
    );
    assert.strictEqual(component.objectives[0].selectedTerms.list[0].terms[0].name, 'term 1');
    assert.strictEqual(component.objectives[1].description.text, 'Objective A');
    assert.strictEqual(
      component.objectives[1].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)'
    );
    assert.strictEqual(component.objectives[1].selectedTerms.list[0].terms[0].name, 'term 0');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('empty list', async function (assert) {
    assert.expect(2);
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);

    await render(
      hbs`<Session::ObjectiveList
        @editable={{true}}
        @session={{this.session}}
      />`
    );
    assert.notOk(component.sortIsVisible);
    assert.strictEqual(component.text, '');
  });

  test('no "sort objectives" button in list with one item', async function (assert) {
    assert.expect(3);
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    this.server.create('sessionObjective', { session });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);

    await render(
      hbs`<Session::ObjectiveList
        @editable={{true}}
        @session={{this.session}}
      />`
    );
    assert.notOk(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.strictEqual(component.objectives.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
