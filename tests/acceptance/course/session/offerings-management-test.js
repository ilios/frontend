import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'dummy/tests/helpers';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Offering Management', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
  });

  test('search for instructor who is a course director #2838', async function (assert) {
    assert.expect(1);

    const users = this.server.createList('user', 3, {
      school: this.school,
    });
    const course = this.server.create('course', {
      school: this.school,
      directors: [users[0], users[1], users[2]],
    });
    const session = this.server.create('session', {
      course,
    });
    this.server.create('offering', {
      session,
    });

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.dateBlocks[0].offerings[0].edit();

    const { offeringForm: form } = page.details.offerings;
    await form.instructorSelectionManager.search.searchBox.set('guy 3');
    assert.strictEqual(form.instructorSelectionManager.search.results.items.length, 1);
  });

  test('searching for course directors as instructors does not remove existing instructors #3479', async function (assert) {
    assert.expect(10);

    const users = this.server.createList('user', 3, {
      school: this.school,
    });

    const course = this.server.create('course', {
      school: this.school,
      directors: [users[0], users[1]],
    });
    const session = this.server.create('session', {
      course,
    });
    this.server.create('offering', {
      session,
    });

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.dateBlocks[0].offerings[0].edit();

    const { offeringForm: form } = page.details.offerings;
    assert.strictEqual(form.instructorSelectionManager.selectedInstructors.instructors.length, 0);
    await form.instructorSelectionManager.search.searchBox.set('guy 2');
    assert.strictEqual(form.instructorSelectionManager.search.results.items.length, 1);
    await form.instructorSelectionManager.search.results.items[0].click();
    assert.strictEqual(form.instructorSelectionManager.selectedInstructors.instructors.length, 1);
    assert.strictEqual(
      form.instructorSelectionManager.selectedInstructors.instructors[0].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );

    await form.instructorSelectionManager.search.searchBox.set('guy 3');
    assert.strictEqual(form.instructorSelectionManager.selectedInstructors.instructors.length, 1);
    assert.strictEqual(
      form.instructorSelectionManager.selectedInstructors.instructors[0].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(form.instructorSelectionManager.search.results.items.length, 1);
    await form.instructorSelectionManager.search.results.items[0].click();
    assert.strictEqual(form.instructorSelectionManager.selectedInstructors.instructors.length, 2);
    assert.strictEqual(
      form.instructorSelectionManager.selectedInstructors.instructors[0].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      form.instructorSelectionManager.selectedInstructors.instructors[1].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
  });

  test('Instructors additional name info is displayed if applicable', async function (assert) {
    const course = this.server.create('course', { school: this.school });
    const session = this.server.create('session', { course });
    const instructor1 = this.server.create('user');
    const instructor2 = this.server.create('user', {
      displayName: 'Clem Chowder',
    });
    this.server.create('offering', {
      session,
      instructors: [instructor1, instructor2],
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(page.details.offerings.dateBlocks[0].offerings[0].instructors.length, 2);
    assert.strictEqual(
      page.details.offerings.dateBlocks[0].offerings[0].instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.notOk(
      page.details.offerings.dateBlocks[0].offerings[0].instructors[0].userNameInfo
        .hasAdditionalInfo
    );
    assert.strictEqual(
      page.details.offerings.dateBlocks[0].offerings[0].instructors[1].userNameInfo.fullName,
      'Clem Chowder'
    );
    assert.ok(
      page.details.offerings.dateBlocks[0].offerings[0].instructors[1].userNameInfo
        .hasAdditionalInfo
    );
    assert.notOk(
      page.details.offerings.dateBlocks[0].offerings[0].instructors[1].userNameInfo.isTooltipVisible
    );
    await page.details.offerings.dateBlocks[0].offerings[0].instructors[1].userNameInfo.expandTooltip();
    assert.ok(
      page.details.offerings.dateBlocks[0].offerings[0].instructors[1].userNameInfo.isTooltipVisible
    );
    assert.strictEqual(
      page.details.offerings.dateBlocks[0].offerings[0].instructors[1].userNameInfo.tooltipContents,
      'Campus name of record: 2 guy M, Mc2son'
    );
    await page.details.offerings.dateBlocks[0].offerings[0].instructors[1].userNameInfo.closeTooltip();
    assert.notOk(
      page.details.offerings.dateBlocks[0].offerings[0].instructors[1].userNameInfo.isTooltipVisible
    );
  });

  test('Learner Group parents are shown in tooltip if applicable', async function (assert) {
    const course = this.server.create('course', { school: this.school });
    const session = this.server.create('session', { course });
    const learnerGroup = this.server.create('learnerGroup', {
      title: 'Top Group',
    });
    const learnerGroup2 = this.server.create('learnerGroup', {
      title: 'Other Top Group',
    });
    const subLearnerGroup = this.server.create('learnerGroup', {
      parent: learnerGroup,
      title: 'Sub-Group',
    });
    const subSubLearnerGroup = this.server.create('learnerGroup', {
      parent: subLearnerGroup,
      title: 'Sub-sub Group',
    });
    const subLearnerGroup2 = this.server.create('learnerGroup', {
      parent: learnerGroup,
      title: 'Sub-Group 2',
    });
    this.server.create('offering', {
      session,
      learnerGroups: [subSubLearnerGroup, subLearnerGroup2, learnerGroup2],
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(page.details.offerings.dateBlocks[0].offerings[0].learnerGroups.length, 3);
    assert.notOk(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[0].isTooltipVisible
    );
    assert.strictEqual(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[0].title,
      'Other Top Group'
    );
    assert.notOk(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[0].isTooltipVisible
    );
    await page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[0].expandTooltip();
    assert.notOk(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[0].isTooltipVisible,
      'no tooltip on top-level group'
    );
    assert.strictEqual(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[1].title,
      'Sub-Group 2'
    );
    assert.notOk(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[1].isTooltipVisible
    );
    await page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[1].expandTooltip();
    assert.ok(page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[1].isTooltipVisible);
    assert.strictEqual(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[1].tooltipContents,
      'Parent group: Top Group'
    );
    await page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[1].closeTooltip();
    assert.strictEqual(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[2].title,
      'Sub-sub Group'
    );
    assert.notOk(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[2].isTooltipVisible
    );
    await page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[2].expandTooltip();
    assert.ok(page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[2].isTooltipVisible);
    assert.strictEqual(
      page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[2].tooltipContents,
      'Parent groups: Top Group » Sub-Group'
    );
    await page.details.offerings.dateBlocks[0].offerings[0].learnerGroups[2].closeTooltip();
  });
});
