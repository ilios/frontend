import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session/objective-list';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/objective-list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function(assert) {
    assert.expect(9);
    const course = this.server.create('course');
    const session = this.server.create('session', { course });

    this.server.create('objective', {
      title: 'Objective A',
      position: 0,
      sessions: [session],
    });

    this.server.create('objective', {
      title: 'Objective B',
      position: 0,
      sessions: [session],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('session', sessionModel);

    await render(
      hbs`<Session::ObjectiveList
        @editable={{true}}
        @session={{this.session}}
      />`
    );
    assert.ok(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.equal(component.headers[0].text, 'Description');
    assert.equal(component.headers[1].text, 'Parent Objectives');
    assert.equal(component.headers[2].text, 'MeSH Terms');
    assert.equal(component.headers[3].text, 'Actions');

    assert.equal(component.objectives.length, 2);
    assert.equal(component.objectives[0].description.text, 'Objective B');
    assert.equal(component.objectives[1].description.text, 'Objective A');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('session', sessionModel);

    await render(
      hbs`<Session::ObjectiveList
        @editable={{true}}
        @session={{this.session}}
      />`
    );
    assert.notOk(component.sortIsVisible);
    assert.equal(component.text, '');
  });

  test('no "sort objectives" button in list with one item', async function(assert) {
    assert.expect(3);
    const course = this.server.create('course');
    const session = this.server.create('session', { course });

    this.server.create('objective', {
      position: 0,
      sessions: [session],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('session', sessionModel);

    await render(
      hbs`<Session::ObjectiveList
        @editable={{true}}
        @session={{this.session}}
      />`
    );
    assert.notOk(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.equal(component.objectives.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
