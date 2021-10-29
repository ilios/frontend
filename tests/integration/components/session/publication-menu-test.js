import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session/publication-menu';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/publication-menu', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible for draft session', async function (assert) {
    this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').find('session', 1);
    this.set('session', sessionModel);
    await render(hbs`<Session::PublicationMenu @session={{this.session}} />`);

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
    const sessionModel = await this.owner.lookup('service:store').find('session', 1);
    this.set('session', sessionModel);
    await render(hbs`<Session::PublicationMenu @session={{this.session}} />`);

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
    const sessionModel = await this.owner.lookup('service:store').find('session', 1);
    this.set('session', sessionModel);
    await render(hbs`<Session::PublicationMenu @session={{this.session}} />`);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'Published');
    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').find('session', 1);
    this.set('session', sessionModel);
    await render(hbs`<Session::PublicationMenu @session={{this.session}} />`);
    assert.ok(component.menuClosed);
    await component.toggle.click();
    assert.ok(component.menuOpen);
  });

  test('correct actions for unpublished session', async function (assert) {
    this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').find('session', 1);
    this.set('session', sessionModel);
    await render(hbs`<Session::PublicationMenu @session={{this.session}} />`);
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
    const sessionModel = await this.owner.lookup('service:store').find('session', 1);
    this.set('session', sessionModel);
    await render(hbs`<Session::PublicationMenu @session={{this.session}} />`);
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
    const sessionModel = await this.owner.lookup('service:store').find('session', 1);
    this.set('session', sessionModel);
    await render(hbs`<Session::PublicationMenu @session={{this.session}} />`);
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
    const sessionModel = await this.owner.lookup('service:store').find('session', 1);
    this.set('session', sessionModel);
    await render(hbs`<Session::PublicationMenu @session={{this.session}} />`);

    assert.ok(component.menuClosed);
    await component.toggle.down();
    assert.ok(component.menuOpen);
  });

  test('escape closes menu', async function (assert) {
    this.server.create('session');
    const sessionModel = await this.owner.lookup('service:store').find('session', 1);
    this.set('session', sessionModel);
    await render(hbs`<Session::PublicationMenu @session={{this.session}} />`);

    await component.toggle.down();
    assert.ok(component.menuOpen);
    await component.toggle.esc();
    assert.ok(component.menuClosed);
  });
});
