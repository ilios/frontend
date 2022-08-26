import { currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/dashboard-week';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Acceptance | Dashboard Week at a Glance', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const today = moment().hour(8);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('shows events', async function (assert) {
    const startOfWeek = today.clone().startOf('week');
    const endOfWeek = today.clone().endOf('week').hour(22).minute(59);
    this.server.create('userevent', {
      user: Number(this.user.id),
      name: 'start of week',
      startDate: startOfWeek.format(),
      endDate: startOfWeek.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
      isPublished: true,
      offering: 1,
    });

    this.server.create('userevent', {
      user: Number(this.user.id),
      name: 'end of week',
      startDate: endOfWeek.format(),
      endDate: endOfWeek.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
      isPublished: true,
      offering: 2,
    });
    await page.visit({ show: 'week' });
    assert.strictEqual(currentRouteName(), 'dashboard.week');

    assert.strictEqual(page.week.weekGlance.events.length, 2);
    assert.strictEqual(page.week.weekGlance.events[0].title, 'start of week');
    assert.strictEqual(page.week.weekGlance.events[1].title, 'end of week');
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

    this.server.create('userevent', {
      user: Number(this.user.id),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
      isPublished: true,
      offering: 1,
      prerequisites,
    });
    await page.visit();
    assert.strictEqual(currentRouteName(), 'dashboard.week');

    assert.strictEqual(page.week.weekGlance.events.length, 1);
    const { learningMaterials } = page.week.weekGlance.events[0];
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

  test('calendar is active in dashboard navigation', async function (assert) {
    await page.visit();
    assert.notOk(page.week.dashboardViewPicker.calendar.isActive);
    assert.notOk(page.week.dashboardViewPicker.materials.isActive);
    assert.ok(page.week.dashboardViewPicker.week.isActive);
  });
});
