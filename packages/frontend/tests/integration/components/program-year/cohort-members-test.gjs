import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import noop from 'ilios-common/helpers/noop';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/program-year/cohort-members';
import CohortMembers from 'frontend/components/program-year/cohort-members';

module('Integration | Component | program-year/cohort-members', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    this.cohort = this.server.create('cohort', { programYear });
    this.programYear = programYear;
    this.school = school;
  });

  test('it renders expanded with data', async function (assert) {
    const otherSchool = this.server.create('school');
    this.server.createList('user', 3, {
      cohorts: [this.cohort],
    });
    this.server.create('user', { enabled: false, cohorts: [this.cohort] });
    this.server.create('course', { school: otherSchool, year: 2025, cohorts: [this.cohort] });

    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    await render(
      <template>
        <CohortMembers
          @programYear={{this.programYear}}
          @isExpanded={{true}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.toggle.ariaControls, component.content.id);
    assert.notOk(component.header.toggle.isCollapsed);
    assert.ok(component.header.toggle.isExpanded);
    assert.strictEqual(component.header.toggle.ariaExpanded, 'true');
    assert.notOk(component.content.isHidden);
    assert.strictEqual(component.header.title, 'Members (4)');

    assert.strictEqual(component.content.headers.member.text, 'Name');

    assert.strictEqual(component.content.members.length, 4);
    assert.strictEqual(
      component.content.members[0].member.userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.strictEqual(component.content.members[0].member.link, '/users/1');
    assert.notOk(component.content.members[0].member.userStatus.accountIsDisabled);
    assert.strictEqual(
      component.content.members[1].member.userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(component.content.members[1].member.link, '/users/2');
    assert.notOk(component.content.members[1].member.userStatus.accountIsDisabled);
    assert.strictEqual(
      component.content.members[2].member.userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    assert.strictEqual(component.content.members[2].member.link, '/users/3');
    assert.notOk(component.content.members[2].member.userStatus.accountIsDisabled);
    assert.strictEqual(
      component.content.members[3].member.userNameInfo.fullName,
      '3 guy M. Mc3son',
    );
    assert.strictEqual(component.content.members[3].member.link, '/users/4');
    assert.ok(component.content.members[3].member.userStatus.accountIsDisabled);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders collapsed with data', async function (assert) {
    const otherSchool = this.server.create('school');
    this.server.createList('user', 3, {
      cohorts: [this.cohort],
    });
    this.server.create('course', { school: otherSchool, year: 2025, cohorts: [this.cohort] });

    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    await render(
      <template>
        <CohortMembers
          @programYear={{this.programYear}}
          @isExpanded={{false}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.header.toggle.ariaControls, component.content.id);
    assert.ok(component.header.toggle.isCollapsed);
    assert.notOk(component.header.toggle.isExpanded);
    assert.strictEqual(component.header.toggle.ariaExpanded, 'false');
    assert.ok(component.content.isHidden);
    assert.strictEqual(component.header.title, 'Members (3)');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders without data', async function (assert) {
    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    await render(
      <template>
        <CohortMembers
          @programYear={{this.programYear}}
          @isExpanded={{false}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.header.toggle.isPresent);
    assert.strictEqual(component.header.title, 'Members (0)');
    assert.notOk(component.content.isPresent);
  });

  test('sorting works', async function (assert) {
    this.server.createList('user', 2, {
      cohorts: [this.cohort],
    });

    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    await render(
      <template>
        <CohortMembers
          @programYear={{this.programYear}}
          @isExpanded={{true}}
          @setIsExpanded={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.content.members.length, 2);
    assert.ok(component.content.headers.member.isSortedAscending);
    assert.strictEqual(
      component.content.members[0].member.userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.strictEqual(
      component.content.members[1].member.userNameInfo.fullName,
      '1 guy M. Mc1son',
    );

    await component.content.headers.member.sort();
    assert.ok(component.content.headers.member.isSortedDescending);
    assert.strictEqual(
      component.content.members[0].member.userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(
      component.content.members[1].member.userNameInfo.fullName,
      '0 guy M. Mc0son',
    );

    await component.content.headers.member.sort();
    assert.ok(component.content.headers.member.isSortedAscending);
    assert.strictEqual(
      component.content.members[0].member.userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.strictEqual(
      component.content.members[1].member.userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
  });

  test('collapse action fires', async function (assert) {
    this.server.create('user', {
      cohorts: [this.cohort],
    });
    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    this.set('setIsExpanded', (value) => {
      assert.step('setIsExpanded called');
      assert.notOk(value);
    });
    await render(
      <template>
        <CohortMembers
          @programYear={{this.programYear}}
          @isExpanded={{true}}
          @setIsExpanded={{this.setIsExpanded}}
        />
      </template>,
    );

    await component.header.toggle.click();
    assert.verifySteps(['setIsExpanded called']);
  });

  test('expand action fires', async function (assert) {
    this.server.create('user', {
      cohorts: [this.cohort],
    });
    const programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', this.programYear.id);
    this.set('programYear', programYear);
    this.set('setIsExpanded', (value) => {
      assert.step('setIsExpanded called');
      assert.ok(value);
    });
    await render(
      <template>
        <CohortMembers
          @programYear={{this.programYear}}
          @isExpanded={{false}}
          @setIsExpanded={{this.setIsExpanded}}
        />
      </template>,
    );

    await component.header.toggle.click();
    assert.verifySteps(['setIsExpanded called']);
  });
});
