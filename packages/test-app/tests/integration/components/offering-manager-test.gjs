import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/offering-manager';
import noop from 'ilios-common/helpers/noop';
import OfferingManager from 'ilios-common/components/offering-manager';

module('Integration | Component | offering-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders with individual learners and learner groups', async function (assert) {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    const users = this.server.createList('user', 4);
    const today = DateTime.fromObject({ hour: 8 });
    const course = this.server.create('course');
    const sessionType = this.server.create('session-type');
    const session = this.server.create('session', {
      course,
      sessionType,
    });
    const learnerGroup1 = this.server.create('learner-group');
    const learnerGroup2 = this.server.create('learner-group');
    const offering = this.server.create('offering', {
      session,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      room: 'room 123',
      learners: [users[0], users[1]],
      learnerGroups: [learnerGroup1, learnerGroup2],
      instructors: [users[2], users[3]],
      url: 'http://foo.com',
    });

    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);

    await render(
      <template>
        <OfferingManager @offering={{this.offering}} @remove={{(noop)}} @editable={{false}} />
      </template>,
    );

    assert.notOk(component.learners.isHidden, 'list of individual learners is displayed');
    assert.strictEqual(component.learnerGroups.length, 2, 'learner groups list has correct count');
    assert.strictEqual(
      component.learners.list,
      '1 guy M. Mc1son, 2 guy M. Mc2son',
      'list of learners correct',
    );
    assert.strictEqual(
      component.learnerGroups[0].title,
      'learner group 0',
      'first learner group title is correct',
    );
    assert.strictEqual(
      component.learnerGroups[1].title,
      'learner group 1',
      'second learner group title is correct',
    );
    assert.strictEqual(component.location, 'room 123', 'offering location is correct');
    assert.ok(component.hasUrl, 'offering has url');
    assert.strictEqual(component.url, 'http://foo.com/', 'url is correct');
    assert.strictEqual(
      component.instructors[0].userNameInfo.fullName,
      '3 guy M. Mc3son',
      'first instructor name is correct',
    );
    assert.strictEqual(
      component.instructors[1].userNameInfo.fullName,
      '4 guy M. Mc4son',
      'second instructor name is correct',
    );
  });

  test('it renders with only learner groups', async function (assert) {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    const users = this.server.createList('user', 2);
    const today = DateTime.fromObject({ hour: 8 });
    const course = this.server.create('course');
    const sessionType = this.server.create('session-type');
    const session = this.server.create('session', {
      course,
      sessionType,
    });
    const learnerGroup1 = this.server.create('learner-group');
    const learnerGroup2 = this.server.create('learner-group');
    const offering = this.server.create('offering', {
      session,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      room: 'room 123',
      learnerGroups: [learnerGroup1, learnerGroup2],
      instructors: [users[0], users[1]],
      url: 'http://foo.com',
    });

    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);

    await render(
      <template>
        <OfferingManager @offering={{this.offering}} @remove={{(noop)}} @editable={{false}} />
      </template>,
    );

    assert.ok(component.learners.isHidden, 'list of individual learners not displayed');
    assert.strictEqual(component.learnerGroups.length, 2, 'learner groups list has correct count');
    assert.strictEqual(
      component.learnerGroups[0].title,
      'learner group 0',
      'first learner group title is correct',
    );
    assert.strictEqual(
      component.learnerGroups[1].title,
      'learner group 1',
      'second learner group title is correct',
    );
    assert.strictEqual(component.location, 'room 123', 'offering location is correct');
    assert.ok(component.hasUrl, 'offering has url');
    assert.strictEqual(component.url, 'http://foo.com/', 'url is correct');
    assert.strictEqual(
      component.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son',
      'first instructor name is correct',
    );
    assert.strictEqual(
      component.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son',
      'second instructor name is correct',
    );
  });

  test('it renders with only individual learners', async function (assert) {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    const users = this.server.createList('user', 4);
    const today = DateTime.fromObject({ hour: 8 });
    const course = this.server.create('course');
    const sessionType = this.server.create('session-type');
    const session = this.server.create('session', {
      course,
      sessionType,
    });
    const offering = this.server.create('offering', {
      session,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      room: 'room 123',
      learners: [users[0], users[1]],
      instructors: [users[2], users[3]],
      url: 'http://foo.com',
    });

    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);

    await render(
      <template>
        <OfferingManager @offering={{this.offering}} @remove={{(noop)}} @editable={{false}} />
      </template>,
    );

    assert.notOk(component.learners.isHidden, 'list of individual learners is displayed');
    assert.strictEqual(
      component.learners.list,
      '1 guy M. Mc1son, 2 guy M. Mc2son',
      'list of learners correct',
    );
    assert.strictEqual(component.learnerGroups.length, 1, 'learner groups list has correct count');
    assert.ok(
      component.learnerGroups[0].displaysUsersIcon,
      'learner groups list first and only item is fa-users icon',
    );
    assert.strictEqual(component.location, 'room 123', 'offering location is correct');
    assert.ok(component.hasUrl, 'offering has url');
    assert.strictEqual(component.url, 'http://foo.com/', 'url is correct');
    assert.strictEqual(
      component.instructors[0].userNameInfo.fullName,
      '3 guy M. Mc3son',
      'first instructor name is correct',
    );
    assert.strictEqual(
      component.instructors[1].userNameInfo.fullName,
      '4 guy M. Mc4son',
      'second instructor name is correct',
    );
  });

  test('it renders with no individual learners or learner groups', async function (assert) {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    const users = this.server.createList('user', 2);
    const today = DateTime.fromObject({ hour: 8 });
    const course = this.server.create('course');
    const sessionType = this.server.create('session-type');
    const session = this.server.create('session', {
      course,
      sessionType,
    });
    const offering = this.server.create('offering', {
      session,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      room: 'room 123',
      instructors: [users[0], users[1]],
      url: 'http://foo.com',
    });

    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);

    await render(
      <template>
        <OfferingManager @offering={{this.offering}} @remove={{(noop)}} @editable={{false}} />
      </template>,
    );

    assert.ok(component.learners.isHidden, 'list of individual learners is not displayed');
    assert.strictEqual(component.learnerGroups.length, 1, 'learner groups list has correct count');
    assert.ok(
      component.learnerGroups[0].displaysUsersIcon,
      'learner groups list first and only item is fa-users icon',
    );
    assert.strictEqual(component.location, 'room 123', 'offering location is correct');
    assert.ok(component.hasUrl, 'offering has url');
    assert.strictEqual(component.url, 'http://foo.com/', 'url is correct');
    assert.strictEqual(
      component.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son',
      'first instructor name is correct',
    );
    assert.strictEqual(
      component.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son',
      'second instructor name is correct',
    );
  });
});
