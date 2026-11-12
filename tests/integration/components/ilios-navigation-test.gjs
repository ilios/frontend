import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import IliosNavigation from 'frontend/components/ilios-navigation';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { component } from 'frontend/tests/pages/components/ilios-navigation';
import { module, test } from 'qunit';

module('Integration | Component | ilios-navigation', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders for privileged user', async function (assert) {
    class CurrentUserMock extends Service {
      performsNonLearnerFunction = true;
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    await render(<template><IliosNavigation /></template>);
    await a11yAudit(this.element);

    assert.ok(component.expandCollapse.isPresent);
    assert.strictEqual(component.links.length, 7);
    assert.strictEqual(component.links[0].text, 'Dashboard');
    assert.strictEqual(component.links[1].text, 'Courses and Sessions');
    assert.strictEqual(component.links[2].text, 'Learner Groups');
    assert.strictEqual(component.links[3].text, 'Instructor Groups');
    assert.strictEqual(component.links[4].text, 'Schools');
    assert.strictEqual(component.links[5].text, 'Programs');
    assert.strictEqual(component.links[6].text, 'Reports');
  });

  test('navigation does not render for non-privileged user', async function (assert) {
    class CurrentUserMock extends Service {
      performsNonLearnerFunction = false;
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    await render(<template><IliosNavigation /></template>);
    await a11yAudit(this.element);

    assert.notOk(component.expandCollapse.isPresent);
    assert.strictEqual(component.links.length, 0);
  });

  test('Super-privileged Users can access Admin', async function (assert) {
    class CurrentUserMock extends Service {
      performsNonLearnerFunction = true;
      canCreateOrUpdateUserInAnySchool = true;
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    await render(<template><IliosNavigation /></template>);
    await a11yAudit(this.element);

    assert.strictEqual(component.links.length, 8);
    assert.strictEqual(component.links[0].text, 'Dashboard');
    assert.strictEqual(component.links[1].text, 'Courses and Sessions');
    assert.strictEqual(component.links[2].text, 'Learner Groups');
    assert.strictEqual(component.links[3].text, 'Instructor Groups');
    assert.strictEqual(component.links[4].text, 'Schools');
    assert.strictEqual(component.links[5].text, 'Programs');
    assert.strictEqual(component.links[6].text, 'Reports');
    assert.strictEqual(component.links[7].text, 'Admin');
  });
});
