import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/pending-updates-summary';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | pending updates summary', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders with updates', async function (assert) {
    const school = this.server.create('school');
    this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    for (let i = 0; i < 5; i++) {
      const user = this.server.create('user', { school });
      this.server.create('pending-user-update', { user });
    }

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const schools = await this.owner.lookup('service:store').findAll('school');
    this.set('schools', schools);
    await render(hbs`<PendingUpdatesSummary @schools={{this.schools}} />`);
    assert.strictEqual(component.title, 'Updates from the Campus Directory');
    assert.strictEqual(component.summary, 'There are 5 users needing attention');
    assert.ok(component.schoolFilter.hasMultiple);
    assert.strictEqual(component.schoolFilter.options.length, 2);
    assert.strictEqual(component.schoolFilter.selected, '1');
    assert.ok(component.hasAlert);

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with one school', async function (assert) {
    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    for (let i = 0; i < 5; i++) {
      const user = this.server.create('user', { school });
      this.server.create('pending-user-update', { user });
    }

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const schools = await this.owner.lookup('service:store').findAll('school');
    this.set('schools', schools);
    await render(hbs`<PendingUpdatesSummary @schools={{this.schools}} />`);
    assert.strictEqual(component.title, 'Updates from the Campus Directory');
    assert.strictEqual(component.summary, 'There are 5 users needing attention');
    assert.notOk(component.schoolFilter.hasMultiple);
    assert.strictEqual(component.schoolFilter.text, 'School school 0');
    assert.ok(component.hasAlert);

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders without updates', async function (assert) {
    const school = this.server.create('school');
    this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const schools = await this.owner.lookup('service:store').findAll('school');
    this.set('schools', schools);
    await render(hbs`<PendingUpdatesSummary @schools={{this.schools}} />`);

    assert.strictEqual(component.title, 'Updates from the Campus Directory');
    assert.strictEqual(component.summary, 'There are 0 users needing attention');
    assert.ok(component.schoolFilter.hasMultiple);
    assert.strictEqual(component.schoolFilter.options.length, 2);
    assert.strictEqual(component.schoolFilter.selected, '1');
    assert.notOk(component.hasAlert);

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('can switch schools', async function (assert) {
    const schools = this.server.createList('school', 3);
    const user = this.server.create('user', { school: schools[1], administeredSchools: schools });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.server.create('pending-user-update', {
      user: this.server.create('user', { school: schools[0] }),
    });
    this.server.createList('pending-user-update', 2, {
      user: this.server.create('user', { school: schools[1] }),
    });

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const schoolModels = await this.owner.lookup('service:store').findAll('school');
    this.set('schools', schoolModels);
    await render(hbs`<PendingUpdatesSummary @schools={{this.schools}} />`);

    assert.strictEqual(component.title, 'Updates from the Campus Directory');
    assert.strictEqual(component.summary, 'There are 2 users needing attention');
    assert.ok(component.schoolFilter.hasMultiple);
    assert.strictEqual(component.schoolFilter.options.length, 3);
    assert.strictEqual(component.schoolFilter.selected, '2');
    assert.ok(component.hasAlert);
    assert.strictEqual(component.manage.link, '/admin/userupdates?school=2');

    await component.schoolFilter.set('1');
    assert.strictEqual(component.summary, 'There is one user needing attention');
    assert.strictEqual(component.schoolFilter.selected, '1');
    assert.ok(component.hasAlert);
    assert.strictEqual(component.manage.link, '/admin/userupdates?school=1');

    await component.schoolFilter.set('3');
    assert.strictEqual(component.summary, 'There are 0 users needing attention');
    assert.strictEqual(component.schoolFilter.selected, '3');
    assert.notOk(component.hasAlert);
    assert.notOk(component.manage.isVisible);
  });
});
