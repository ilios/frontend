import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/ilios-navigation';

module('Integration | Component | ilios-navigation', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders for privileged user', async function (assert) {
    const currentUserMock = Service.extend({
      performsNonLearnerFunction: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    await render(hbs`<IliosNavigation />`);
    await a11yAudit(this.element);

    assert.ok(component.expandCollapse.isPresent);
    assert.equal(component.links.length, 7);
    assert.equal(component.links[0].text, 'Dashboard');
    assert.equal(component.links[1].text, 'Courses and Sessions');
    assert.equal(component.links[2].text, 'Learner Groups');
    assert.equal(component.links[3].text, 'Instructor Groups');
    assert.equal(component.links[4].text, 'Schools');
    assert.equal(component.links[5].text, 'Programs');
    assert.equal(component.links[6].text, 'Curriculum Inventory');
  });

  test('navigation does not render for non-privileged user', async function (assert) {
    const currentUserMock = Service.extend({
      performsNonLearnerFunction: false,
    });
    this.owner.register('service:currentUser', currentUserMock);

    await render(hbs`<IliosNavigation />`);
    await a11yAudit(this.element);

    assert.notOk(component.expandCollapse.isPresent);
    assert.equal(component.links.length, 0);
  });

  test('Super-privileged Users can access Admin', async function (assert) {
    const currentUserMock = Service.extend({
      performsNonLearnerFunction: true,
      canCreateOrUpdateUserInAnySchool: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    await render(hbs`<IliosNavigation />`);
    await a11yAudit(this.element);

    assert.equal(component.links.length, 8);
    assert.equal(component.links[0].text, 'Dashboard');
    assert.equal(component.links[1].text, 'Courses and Sessions');
    assert.equal(component.links[2].text, 'Learner Groups');
    assert.equal(component.links[3].text, 'Instructor Groups');
    assert.equal(component.links[4].text, 'Schools');
    assert.equal(component.links[5].text, 'Programs');
    assert.equal(component.links[6].text, 'Admin');
    assert.equal(component.links[7].text, 'Curriculum Inventory');
  });
});
