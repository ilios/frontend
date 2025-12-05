import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/leadership-expanded';
import { setupMSW } from 'ilios-common/msw';
import LeadershipExpanded from 'ilios-common/components/leadership-expanded';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | leadership expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  module('course', function () {
    test('it renders', async function (assert) {
      const users = await this.server.createList('user', 2);
      const course = await this.server.create('course', {
        directors: [users[0]],
        administrators: users,
        studentAdvisors: [users[0]],
      });
      const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
      this.set('course', courseModel);
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.course}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );

      assert.strictEqual(component.title, 'Leadership (4)');
      assert.strictEqual(component.leadershipList.directors.length, 1);
      assert.strictEqual(component.leadershipList.directors[0].text, '0 guy M. Mc0son');
      assert.strictEqual(component.leadershipList.administrators.length, 2);
      assert.strictEqual(component.leadershipList.administrators[0].text, '0 guy M. Mc0son');
      assert.strictEqual(component.leadershipList.administrators[1].text, '1 guy M. Mc1son');
      assert.strictEqual(component.leadershipList.studentAdvisors.length, 1);
      assert.strictEqual(component.leadershipList.studentAdvisors[0].text, '0 guy M. Mc0son');
    });

    test('clicking the header collapses when there are administrators', async function (assert) {
      const administrators = await this.server.createList('user', 1);
      const course = await this.server.create('course', {
        administrators,
      });
      const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
      this.set('course', courseModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.course}}
            @editable={{true}}
            @collapse={{this.click}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      await component.collapse();
      assert.verifySteps(['click called']);
    });

    test('clicking the header collapses when there are directors', async function (assert) {
      const directors = await this.server.createList('user', 1);
      const course = await this.server.create('course', {
        directors,
      });
      const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
      this.set('course', courseModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.course}}
            @editable={{true}}
            @collapse={{this.click}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      await component.collapse();
      assert.verifySteps(['click called']);
    });

    test('clicking the header collapses when there are student advisors', async function (assert) {
      const studentAdvisors = await this.server.createList('user', 1);
      const course = await this.server.create('course', {
        studentAdvisors,
      });
      const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
      this.set('course', courseModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.course}}
            @editable={{true}}
            @collapse={{this.click}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      await component.collapse();
      assert.verifySteps(['click called']);
    });

    test('clicking manage fires action', async function (assert) {
      const course = await this.server.create('course');
      const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
      this.set('course', courseModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.course}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{this.click}}
          />
        </template>,
      );
      await component.manage();
      assert.verifySteps(['click called']);
    });
  });

  module('session', function () {
    test('it renders', async function (assert) {
      const users = await this.server.createList('user', 2);
      const course = await this.server.create('course');
      const session = await this.server.create('session', {
        course,
        administrators: users,
        studentAdvisors: [users[0]],
      });
      const sessionModel = await this.owner
        .lookup('service:store')
        .findRecord('session', session.id);
      this.set('session', sessionModel);
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.session}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );

      assert.strictEqual(component.title, 'Leadership (3)');
      assert.strictEqual(component.leadershipList.administrators.length, 2);
      assert.strictEqual(component.leadershipList.administrators[0].text, '0 guy M. Mc0son');
      assert.strictEqual(component.leadershipList.administrators[1].text, '1 guy M. Mc1son');
      assert.strictEqual(component.leadershipList.studentAdvisors.length, 1);
      assert.strictEqual(component.leadershipList.studentAdvisors[0].text, '0 guy M. Mc0son');
    });

    test('clicking the header collapses when there are administrators', async function (assert) {
      const administrators = await this.server.createList('user', 1);
      const course = await this.server.create('course');
      const session = await this.server.create('session', {
        course,
        administrators,
      });
      const sessionModel = await this.owner
        .lookup('service:store')
        .findRecord('session', session.id);
      this.set('session', sessionModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.session}}
            @editable={{true}}
            @collapse={{this.click}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      await component.collapse();
      assert.verifySteps(['click called']);
    });

    test('clicking the header collapses when there are student advisors', async function (assert) {
      const studentAdvisors = await this.server.createList('user', 1);
      const course = await this.server.create('course');
      const session = await this.server.create('session', {
        course,
        studentAdvisors,
      });
      const sessionModel = await this.owner
        .lookup('service:store')
        .findRecord('session', session.id);
      this.set('session', sessionModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.session}}
            @editable={{true}}
            @collapse={{this.click}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      await component.collapse();
      assert.verifySteps(['click called']);
    });

    test('clicking manage fires action', async function (assert) {
      const session = await this.server.create('session');
      const sessionModel = await this.owner
        .lookup('service:store')
        .findRecord('session', session.id);
      this.set('session', sessionModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.session}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{this.click}}
          />
        </template>,
      );
      await component.manage();
      assert.verifySteps(['click called']);
    });
  });

  module('program', function () {
    test('it renders', async function (assert) {
      const user1 = await this.server.create('user', {
        firstName: 'a',
        lastName: 'person',
      });
      const user2 = await this.server.create('user', {
        firstName: 'b',
        lastName: 'person',
      });
      const program = await this.server.create('program', {
        directors: [user1, user2],
      });
      const programModel = await this.owner
        .lookup('service:store')
        .findRecord('program', program.id);

      this.set('program', programModel);
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.program}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      assert.strictEqual(component.title, 'Leadership (2)');
      assert.strictEqual(component.leadershipList.directors.length, 2);
      assert.strictEqual(component.leadershipList.directors[0].text, 'a M. person');
      assert.strictEqual(component.leadershipList.directors[1].text, 'b M. person');
    });

    test('clicking the header collapses', async function (assert) {
      const program = await this.server.create('program');
      const programModel = await this.owner
        .lookup('service:store')
        .findRecord('program', program.id);

      this.set('program', programModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.program}}
            @editable={{true}}
            @collapse={{this.click}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      await component.collapse();
      assert.verifySteps(['click called']);
    });

    test('clicking manage fires action', async function (assert) {
      const program = await this.server.create('program');
      const programModel = await this.owner
        .lookup('service:store')
        .findRecord('program', program.id);

      this.set('program', programModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.program}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{this.click}}
          />
        </template>,
      );
      await component.manage();
      assert.verifySteps(['click called']);
    });
  });

  module('program year', function () {
    test('it renders', async function (assert) {
      const user1 = await this.server.create('user', {
        firstName: 'a',
        lastName: 'person',
      });
      const user2 = await this.server.create('user', {
        firstName: 'b',
        lastName: 'person',
      });
      const program = await this.server.create('program');
      const programYear = await this.server.create('program-year', {
        directors: [user1, user2],
        program,
      });
      const programYearModel = await this.owner
        .lookup('service:store')
        .findRecord('program-year', programYear.id);
      this.set('programYear', programYearModel);
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.programYear}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      assert.strictEqual(component.title, 'Leadership (2)');
      assert.strictEqual(component.leadershipList.directors.length, 2);
      assert.strictEqual(component.leadershipList.directors[0].text, 'a M. person');
      assert.strictEqual(component.leadershipList.directors[1].text, 'b M. person');
    });

    test('clicking the header collapses', async function (assert) {
      const program = await this.server.create('program');
      const programYear = await this.server.create('program-year', {
        program,
      });
      const programYearModel = await this.owner
        .lookup('service:store')
        .findRecord('program-year', programYear.id);
      this.set('programYear', programYearModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.programYear}}
            @editable={{true}}
            @collapse={{this.click}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      await component.collapse();
      assert.verifySteps(['click called']);
    });

    test('clicking manage fires action', async function (assert) {
      const program = await this.server.create('program');
      const programYear = await this.server.create('program-year', {
        program,
      });
      const programYearModel = await this.owner
        .lookup('service:store')
        .findRecord('program-year', programYear.id);
      this.set('programYear', programYearModel);
      this.set('click', () => {
        assert.step('click called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.programYear}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{this.click}}
          />
        </template>,
      );
      await component.manage();
      assert.verifySteps(['click called']);
    });
  });

  module('school', function () {
    test('it renders', async function (assert) {
      const user1 = await this.server.create('user');
      const user2 = await this.server.create('user');
      const school = await this.server.create('school', {
        directors: [user1],
        administrators: [user1, user2],
      });

      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
      this.set('school', schoolModel);
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.school}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      assert.strictEqual(component.title, 'Leadership (3)');
      assert.strictEqual(component.leadershipList.directors.length, 1);
      assert.strictEqual(component.leadershipList.directors[0].text, '0 guy M. Mc0son');
      assert.strictEqual(component.leadershipList.administrators.length, 2);
      assert.strictEqual(component.leadershipList.administrators[0].text, '0 guy M. Mc0son');
      assert.strictEqual(component.leadershipList.administrators[1].text, '1 guy M. Mc1son');
    });

    test('clicking the header collapses', async function (assert) {
      const user1 = await this.server.create('user');
      const school = await this.server.create('school', {
        directors: [user1],
      });
      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
      this.set('school', schoolModel);
      this.set('collapse', () => {
        assert.step('collapse called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.school}}
            @editable={{true}}
            @collapse={{this.collapse}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      await component.collapse();
      assert.verifySteps(['collapse called']);
    });

    test('clicking manage fires action', async function (assert) {
      const school = await this.server.create('school', {});
      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
      this.set('school', schoolModel);
      this.set('manage', () => {
        assert.step('manage called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.school}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{this.manage}}
          />
        </template>,
      );

      await component.manage();
      assert.verifySteps(['manage called']);
    });

    // @link https://github.com/ilios/frontend/issues/5732
    test('managing mode', async function (assert) {
      const school = await this.server.create('school');
      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
      this.set('school', schoolModel);
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.school}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{true}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );

      assert.ok(component.leadershipManager.isVisible);
    });
  });

  module('curriculum inventory report', function () {
    test('it renders', async function (assert) {
      const administrators = await this.server.createList('user', 2);
      const report = await this.server.create('curriculum-inventory-report', {
        administrators,
      });
      const reportModel = await this.owner
        .lookup('service:store')
        .findRecord('curriculum-inventory-report', report.id);
      this.set('report', reportModel);
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.report}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      assert.strictEqual(component.leadershipList.administrators.length, 2);
      assert.strictEqual(component.leadershipList.administrators[0].text, '0 guy M. Mc0son');
      assert.strictEqual(component.leadershipList.administrators[1].text, '1 guy M. Mc1son');
    });

    test('clicking the header collapses', async function (assert) {
      const report = await this.server.create('curriculum-inventory-report');
      const reportModel = await this.owner
        .lookup('service:store')
        .findRecord('curriculum-inventory-report', report.id);

      this.set('report', reportModel);
      this.set('collapse', () => {
        assert.step('collapse called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.report}}
            @editable={{true}}
            @collapse={{this.collapse}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{(noop)}}
          />
        </template>,
      );
      await component.collapse();
      assert.verifySteps(['collapse called']);
    });

    test('clicking manage fires action', async function (assert) {
      const report = await this.server.create('curriculum-inventory-report');
      const reportModel = await this.owner
        .lookup('service:store')
        .findRecord('curriculum-inventory-report', report.id);

      this.set('report', reportModel);
      this.set('manage', () => {
        assert.step('manage called');
      });
      await render(
        <template>
          <LeadershipExpanded
            @model={{this.report}}
            @editable={{true}}
            @collapse={{(noop)}}
            @expand={{(noop)}}
            @isManaging={{false}}
            @setIsManaging={{this.manage}}
          />
        </template>,
      );
      await component.manage();
      assert.verifySteps(['manage called']);
    });
  });
});
