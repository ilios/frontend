import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/session/publication-menu';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMSW } from 'ilios-common/msw';
import PublicationMenu from 'ilios-common/components/session/publication-menu';

module('Integration | Component | session/publication-menu', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders and is accessible for draft session', async function (assert) {
    this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', 1);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);

    await a11yAudit(this.element, {
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });
    assert.strictEqual(component.text, 'Not Published');
    await component.toggle.click();
    await a11yAudit(this.element, {
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible for scheduled session', async function (assert) {
    this.server.create('session', {
      published: true,
      publishedAsTbd: true,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', 1);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'Scheduled');
    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible for published session', async function (assert) {
    this.server.create('session', {
      published: true,
      publishedAsTbd: false,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', 1);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'Published');
    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', 1);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);
    assert.ok(component.menuClosed);
    await component.toggle.click();
    assert.ok(component.menuOpen);
  });

  test('correct actions for unpublished session', async function (assert) {
    this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', 1);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.notOk(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.ok(component.hasTbd);
    assert.notOk(component.hasUnPublish);
  });

  test('correct actions for scheduled session', async function (assert) {
    this.server.create('session', {
      published: true,
      publishedAsTbd: true,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', 1);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.notOk(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.notOk(component.hasTbd);
    assert.ok(component.hasUnPublish);
  });

  test('correct actions for published session', async function (assert) {
    this.server.create('session', {
      published: true,
      publishedAsTbd: false,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', 1);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.notOk(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.ok(component.hasTbd);
    assert.ok(component.hasUnPublish);
  });

  test('down opens menu', async function (assert) {
    this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', 1);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);

    assert.ok(component.menuClosed);
    await component.toggle.down();
    assert.ok(component.menuOpen);
  });

  test('escape closes menu', async function (assert) {
    this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', 1);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);

    await component.toggle.down();
    assert.ok(component.menuOpen);
    await component.toggle.esc();
    assert.ok(component.menuClosed);
  });

  test('dropdown options are accessible for unpublished session', async function (assert) {
    const session = this.server.create('session', {
      published: false,
      publishedAsTbd: false,
    });
    this.server.create('offering', { session });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.ok(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.ok(component.hasTbd);
    assert.notOk(component.hasUnPublish);

    assert.strictEqual(component.selectedMenuItem, 'Review 2 Missing Items');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');

    await component.menu.up();
    assert.strictEqual(component.selectedMenuItem, 'Publish As-is');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');

    await component.menu.up();
    assert.strictEqual(component.selectedMenuItem, 'Mark as Scheduled');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('dropdown options are accessible for published session', async function (assert) {
    const session = this.server.create('session', {
      published: true,
      publishedAsTbd: false,
    });
    this.server.create('offering', { session });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    await render(<template><PublicationMenu @session={{this.session}} /></template>);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.notOk(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.ok(component.hasTbd);
    assert.ok(component.hasUnPublish);

    assert.strictEqual(component.selectedMenuItem, 'Review 2 Missing Items');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');

    await component.menu.up();
    assert.strictEqual(component.selectedMenuItem, 'UnPublish Session');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');

    await component.menu.up();
    assert.strictEqual(component.selectedMenuItem, 'Mark as Scheduled');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
