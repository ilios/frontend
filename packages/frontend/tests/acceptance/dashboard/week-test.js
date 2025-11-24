import { currentRouteName } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/dashboard-week';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import percySnapshot from '@percy/ember';

module('Acceptance | Dashboard Week at a Glance', function (hooks) {
  setupApplicationTest(hooks);

  const today = DateTime.fromObject({ hour: 8 });

  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('shows events', async function (assert) {
    const aug16th2023 = DateTime.fromObject({
      year: 2023,
      month: 8,
      day: 16,
      hour: 10,
    });
    freezeDateAt(aug16th2023.toJSDate());
    const { firstDayOfThisWeek, lastDayOfThisWeek } = this.owner.lookup('service:locale-days');
    const startOfWeek = DateTime.fromJSDate(firstDayOfThisWeek);
    const endOfWeek = DateTime.fromJSDate(lastDayOfThisWeek);
    this.server.create('userevent', {
      user: Number(this.user.id),
      name: 'start of week',
      startDate: startOfWeek.toJSDate(),
      endDate: startOfWeek.plus({ hour: 1 }).toJSDate(),
      lastModified: today.minus({ year: 1 }).toJSDate(),
      isPublished: true,
      offering: 1,
    });

    this.server.create('userevent', {
      user: Number(this.user.id),
      name: 'end of week',
      startDate: endOfWeek.minus({ hour: 1 }).toJSDate(),
      endDate: endOfWeek.toJSDate(),
      lastModified: today.minus({ year: 1 }).toJSDate(),
      isPublished: true,
      offering: 2,
    });
    await page.visit({ show: 'week' });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(currentRouteName(), 'dashboard.week');

    assert.strictEqual(page.week.weekGlance.eventsByDate.length, 2);
    assert.strictEqual(page.week.weekGlance.eventsByDate[0].events.length, 1);
    assert.strictEqual(page.week.weekGlance.eventsByDate[0].events[0].title, 'start of week');
    assert.strictEqual(page.week.weekGlance.eventsByDate[1].events.length, 1);
    assert.strictEqual(page.week.weekGlance.eventsByDate[1].events[0].title, 'end of week');
  });

  test('shows all pre work', async function (assert) {
    const prerequisites = [1, 2, 3].map((id) => {
      return {
        user: Number(this.user.id),
        name: `pre ${id}`,
        isPublished: true,
        ilmSession: id,
        session: id,
        prerequisites: [],
        postrequisites: [],
        learningMaterials: [],
      };
    });
    prerequisites[0]['learningMaterials'].push({
      id: 1,
      title: 'pre mat 1',
      sessionLearningMaterial: 13,
    });
    prerequisites[0]['learningMaterials'].push({
      id: 2,
      title: 'pre mat 2',
      sessionLearningMaterial: 99,
    });
    prerequisites[1]['learningMaterials'].push({
      id: 3,
      title: 'course mat 1',
      courseLearningMaterial: 6,
    });
    prerequisites[2]['learningMaterials'].push({
      id: 4,
      title: 'pre mat 3',
      sessionLearningMaterial: 24,
    });
    const oct31st2018 = DateTime.fromObject({
      year: 2018,
      month: 10,
      day: 31,
      hour: 8,
    });
    freezeDateAt(oct31st2018.toJSDate());

    this.server.create('userevent', {
      user: Number(this.user.id),
      startDate: oct31st2018.toJSDate(),
      endDate: oct31st2018.plus({ hour: 1 }).toJSDate(),
      lastModified: oct31st2018.minus({ year: 1 }).toJSDate(),
      isPublished: true,
      offering: 1,
      prerequisites,
    });
    await page.visit();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(currentRouteName(), 'dashboard.week');

    assert.strictEqual(page.week.weekGlance.eventsByDate.length, 1);
    assert.strictEqual(page.week.weekGlance.eventsByDate[0].events.length, 1);
    const { learningMaterials } = page.week.weekGlance.eventsByDate[0].events[0];
    assert.strictEqual(learningMaterials.prework.length, 3);
    assert.strictEqual(learningMaterials.prework[0].name, 'pre 1');
    assert.strictEqual(learningMaterials.prework[0].materials.length, 2);
    assert.strictEqual(learningMaterials.prework[0].materials[0].title, 'pre mat 2');
    assert.strictEqual(learningMaterials.prework[0].materials[1].title, 'pre mat 1');

    assert.strictEqual(learningMaterials.prework[1].name, 'pre 2');
    assert.strictEqual(learningMaterials.prework[1].materials.length, 0);
    assert.strictEqual(learningMaterials.prework[2].name, 'pre 3');
    assert.strictEqual(learningMaterials.prework[2].materials.length, 1);
    assert.strictEqual(learningMaterials.prework[2].materials[0].title, 'pre mat 3');

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('week summary displays the whole week', async function (assert) {
    const startOfTheWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').firstDayOfThisWeek,
    ).set({ minute: 2 });
    const endOfTheWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').lastDayOfThisWeek,
    ).set({ hour: 22, minute: 5 });

    this.server.create('userevent', {
      user: this.user.id,
      startDate: startOfTheWeek.toJSDate(),
      endDate: startOfTheWeek.plus({ hour: 1 }).toJSDate(),
      offering: 1,
      isPublished: true,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: endOfTheWeek.toJSDate(),
      endDate: endOfTheWeek.plus({ hour: 1 }).toJSDate(),
      offering: 2,
      isPublished: true,
    });

    await page.visit();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
    };
    assert.strictEqual(page.week.weekGlance.eventsByDate.length, 2);
    assert.strictEqual(page.week.weekGlance.eventsByDate[0].events.length, 1);
    assert.strictEqual(
      page.week.weekGlance.eventsByDate[0].events[0].text,
      'event 0 ' + this.intl.formatTime(startOfTheWeek.toJSDate(), options) + ' (Duration: 1 hour)',
    );
    assert.strictEqual(page.week.weekGlance.eventsByDate[1].events.length, 1);
    assert.strictEqual(
      page.week.weekGlance.eventsByDate[1].events[0].text,
      'event 1 ' + this.intl.formatTime(endOfTheWeek.toJSDate(), options) + ' (Duration: 1 hour)',
    );
  });

  test('calendar is active in dashboard navigation', async function (assert) {
    await page.visit();
    assert.notOk(page.navigation.calendar.isActive);
    assert.notOk(page.navigation.materials.isActive);
    assert.ok(page.navigation.week.isActive);
  });
});
