import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/course/publication-menu';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/publication-menu', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders and is accessible for draft course', async function (assert) {
    this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);

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

  test('it renders and is accessible for scheduled course', async function (assert) {
    this.server.create('course', {
      published: true,
      publishedAsTbd: true,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'Scheduled');
    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible for published course', async function (assert) {
    this.server.create('course', {
      published: true,
      publishedAsTbd: false,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'Published');
    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);
    assert.ok(component.menuClosed);
    await component.toggle.click();
    assert.ok(component.menuOpen);
  });

  test('correct actions for unpublished course', async function (assert) {
    this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.notOk(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.ok(component.hasTbd);
    assert.notOk(component.hasUnPublish);
  });

  test('correct actions for unpublished course with required cohort', async function (assert) {
    const cohort = this.server.create('cohort');
    this.server.create('course', {
      cohorts: [cohort],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.ok(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.ok(component.hasTbd);
    assert.notOk(component.hasUnPublish);
  });

  test('correct actions for scheduled course', async function (assert) {
    this.server.create('course', {
      published: true,
      publishedAsTbd: true,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.notOk(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.notOk(component.hasTbd);
    assert.ok(component.hasUnPublish);
  });

  test('correct actions for scheduled course with required cohort', async function (assert) {
    const cohort = this.server.create('cohort');
    this.server.create('course', {
      cohorts: [cohort],
      published: true,
      publishedAsTbd: true,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.ok(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.notOk(component.hasTbd);
    assert.ok(component.hasUnPublish);
  });

  test('correct actions for published course', async function (assert) {
    this.server.create('course', {
      published: true,
      publishedAsTbd: false,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);
    await component.toggle.click();
    assert.ok(component.menuOpen);
    assert.notOk(component.hasPublishAsIs);
    assert.notOk(component.hasPublish);
    assert.ok(component.hasReview);
    assert.ok(component.hasTbd);
    assert.ok(component.hasUnPublish);
  });

  test('down opens menu', async function (assert) {
    this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);

    assert.ok(component.menuClosed);
    await component.toggle.down();
    assert.ok(component.menuOpen);
  });

  test('escape closes menu', async function (assert) {
    this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 1);
    this.set('course', courseModel);
    await render(hbs`<Course::PublicationMenu @course={{this.course}} />
`);

    await component.toggle.down();
    assert.ok(component.menuOpen);
    await component.toggle.esc();
    assert.ok(component.menuClosed);
  });
});
