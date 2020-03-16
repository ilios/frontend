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
    const courseObjective = this.server.create('objective', {
      courses: [course],
    });
    const session = this.server.create('session', { course });
    this.server.createList('objective', 2, { sessions: [session] });
    this.server.create('objective', {
      sessions: [session],
      parents: [ courseObjective ],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`<Session::Objectives
      @session={{this.session}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.current.length, 3);
    assert.equal(component.current[0].description.text, 'objective 1');
    assert.equal(component.current[0].parents.length, 0);
    assert.equal(component.current[0].meshTerms.length, 0);

    assert.equal(component.current[1].description.text, 'objective 2');
    assert.equal(component.current[1].parents.length, 0);
    assert.equal(component.current[1].meshTerms.length, 0);

    assert.equal(component.current[2].description.text, 'objective 3');
    assert.equal(component.current[2].parents.length, 1);
    assert.equal(component.current[2].parents[0].description, 'objective 0');
    assert.equal(component.current[2].meshTerms.length, 0);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
