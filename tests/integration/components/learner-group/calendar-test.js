import { module, test, todo } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/learner-group/calendar';
import { DateTime } from 'luxon';

module('Integration | Component | learner-group/calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const today = DateTime.fromObject({ hour: 8 });
    const course = this.server.create('course', {
      title: 'course title',
    });
    const session = this.server.create('session', {
      title: 'session title',
      course,
    });
    const offering1 = this.server.create('offering', {
      startDate: today.toJSON(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      location: '123',
      session,
    });
    const offering2 = this.server.create('offering', {
      startDate: today.toJSON(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      location: '123',
      session,
    });
    const learnerGroup = this.server.create('learner-group', {
      offerings: [offering1],
    });
    this.server.create('learner-group', {
      offerings: [offering2],
      parent: learnerGroup,
    });
    this.learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
  });

  test('shows events', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    await render(hbs`<LearnerGroup::Calendar @learnerGroup={{this.learnerGroup}} />`);
    assert.strictEqual(component.calendar.events.length, 1);
  });

  test('shows subgroup events', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    await render(hbs`<LearnerGroup::Calendar @learnerGroup={{this.learnerGroup}} />`);
    assert.strictEqual(component.calendar.events.length, 1);
    await component.showSubgroups.toggle.click();
    assert.strictEqual(component.calendar.events.length, 2);
  });

  todo('in-draft event is indicated as such', function () {
    // @todo implement this once our page object is up to the job [ST 2023/07/03].
    // @see https://github.com/ilios/common/pull/3430
  });

  todo('scheduled event is indicated as such', function () {
    // @todo implement this once our page object is up to the job [ST 2023/07/03].
    // @see https://github.com/ilios/common/pull/3430
  });
});
