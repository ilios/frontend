import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-overview';

module('Integration | Component | curriculum-inventory/sequence-block-overview', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school,
    });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
      isFinalized: false,
    });
    const academicLevels = [];
    for (let i = 1; i <= 10; i++) {
      academicLevels.push(
        this.server.create('curriculum-inventory-academic-level', {
          report,
          level: i,
          name: `Year ${i}`,
        })
      );
    }
    this.academicLevels = academicLevels;
    this.report = report;
    this.school = school;
  });

  test('it renders', async function (assert) {
    const clerkshipType = this.server.create('course-clerkship-type', { title: 'Block' });
    const course = this.server.create('course', {
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType,
      level: 4,
      school: this.school,
    });
    const parentBlock = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
    });
    const startingAcademicLevel = this.academicLevels[0];
    const endingAcademicLevel = this.academicLevels[1];
    const ilmSessionType = this.server.create('session-type', { title: 'Independent Learning' });
    const ilmSession = this.server.create('ilm-session');
    this.server.create('session', {
      course,
      title: 'Session A',
      sessionType: ilmSessionType,
      ilmSession,
      published: true,
    });
    const presentationSessionType = this.server.create('session-type', { title: 'Presentation' });
    this.server.create('session', {
      course,
      title: 'Session B',
      sessionType: presentationSessionType,
      published: true,
    });
    const lectureSessionType = this.server.create('session-type', { title: 'Lecture' });
    this.server.create('session', {
      course,
      title: 'Session C',
      sessionType: lectureSessionType,
      published: true,
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report: this.report,
      parent: parentBlock,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course,
      required: 3,
      track: true,
      minimum: 2,
      maximum: 15,
      startingAcademicLevel,
      endingAcademicLevel,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(
      component.description.text,
      `Description: ${sequenceBlockModel.description}`
    );
    assert.ok(component.description.isEditable);
    assert.strictEqual(
      component.course.text,
      'Course: Course A Level: 4, Start Date: 2015-02-02, End Date: 2015-03-30 - Clerkship (Block)'
    );
    assert.ok(component.course.isEditable);
    const startLevel = await sequenceBlockModel.startingAcademicLevel;
    const endLevel = await sequenceBlockModel.endingAcademicLevel;
    assert.strictEqual(component.startLevel.text, `Start Level: ${startLevel.name}`);
    assert.strictEqual(component.endLevel.text, `End Level: ${endLevel.name}`);
    assert.ok(component.startLevel.isEditable);
    assert.ok(component.endLevel.isEditable);
    assert.strictEqual(component.required.text, 'Required: Required In Track');
    assert.ok(component.required.isEditable);
    assert.strictEqual(component.track.label, 'Is Track:');
    assert.strictEqual(component.track.yesNoToggle.checked, 'true');
    assert.ok(component.track.isEditable);
    assert.strictEqual(
      component.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.startDate.isEditable);
    assert.strictEqual(
      component.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.ok(component.endDate.isEditable);
    assert.strictEqual(
      component.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    assert.ok(component.duration.isEditable);
    assert.strictEqual(component.childSequenceOrder.text, 'Child Sequence Order: Ordered');
    assert.ok(component.childSequenceOrder.isEditable);
    assert.strictEqual(
      component.orderInSequence.text,
      `Order in Sequence: ${sequenceBlockModel.orderInSequence}`
    );
    assert.ok(component.orderInSequence.isEditable);
    assert.strictEqual(component.minimum.text, `Minimum: ${sequenceBlockModel.minimum}`);
    assert.ok(component.minimum.isEditable);
    assert.strictEqual(component.maximum.text, `Maximum: ${sequenceBlockModel.maximum}`);
    assert.ok(component.maximum.isEditable);
    assert.strictEqual(component.sessions.label, 'Sessions (3)');
    assert.ok(component.sessions.editButton.isVisible);
    assert.notOk(component.sessionManager.isVisible);
    assert.strictEqual(component.sessionList.sessions.length, 3);
  });

  test('order in sequence is n/a for top level block', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.orderInSequence.text, 'Order in Sequence: n/a');
  });

  test('order in sequence is n/a for nested sequence block in non-ordered sequence ', async function (assert) {
    const parentBlock = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 0,
      report: this.report,
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      id: 2,
      description: 'lorem ipsum',
      report: this.report,
      parent: parentBlock,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.orderInSequence.text, 'Order in Sequence: n/a');
  });

  test('change course', async function (assert) {
    const clerkshipType = this.server.create('course-clerkship-type');
    const course = this.server.create('course', {
      title: 'Alpha',
      school: this.school,
      clerkshipType,
      published: true,
      year: '2016',
      startDate: new Date('2016-01-01'),
      endDate: new Date('2016-01-02'),
    });
    this.server.create('course', {
      title: 'Beta',
      school: this.school,
      clerkshipType,
      published: true,
      year: '2016',
      startDate: new Date('2016-02-01'),
      endDate: new Date('2016-02-02'),
    });
    const newCourse = this.server.create('course', {
      title: 'Gamma',
      school: this.school,
      clerkshipType,
      published: true,
      year: '2016',
      startDate: new Date('2016-03-01'),
      endDate: new Date('2016-03-02'),
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    const newCourseModel = await this.owner.lookup('service:store').find('course', newCourse.id);
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(
      component.course.text,
      'Course: Alpha Level: 1, Start Date: 2016-01-01, End Date: 2016-01-02 - Clerkship (clerkship type 0)'
    );
    await component.course.edit();
    assert.strictEqual(component.course.options.length, 4);
    assert.strictEqual(component.course.options[0].text, 'Select a Course');
    assert.strictEqual(component.course.options[1].text, 'Alpha');
    assert.strictEqual(
      component.course.details,
      'Level: 1, Start Date: 2016-01-01, End Date: 2016-01-02 - Clerkship (clerkship type 0)'
    );
    assert.strictEqual(component.course.options[1].value, courseModel.id);
    assert.ok(component.course.options[1].isSelected);
    assert.strictEqual(component.course.options[2].text, 'Beta');
    assert.strictEqual(component.course.options[3].text, 'Gamma');
    await component.course.select(newCourseModel.id);
    assert.strictEqual(
      component.course.details,
      'Level: 1, Start Date: 2016-03-01, End Date: 2016-03-02 - Clerkship (clerkship type 0)'
    );
    await component.course.save();
    assert.strictEqual(
      component.course.text,
      'Course: Gamma Level: 1, Start Date: 2016-03-01, End Date: 2016-03-02 - Clerkship (clerkship type 0)'
    );
    const blockCourse = await sequenceBlockModel.course;
    assert.strictEqual(blockCourse.id, newCourse.id);
  });

  test('change description', async function (assert) {
    const newDescription = 'Lorem Ipsum';
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.description.text, 'Description: Click to add a description.');
    await component.description.edit();
    await component.description.set(newDescription);
    await component.description.save();
    assert.strictEqual(component.description.text, `Description: ${newDescription}`);
  });

  test('change required', async function (assert) {
    const newVal = 1;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.required.text, 'Required: Optional (elective)');
    await component.required.edit();
    await component.required.select(newVal);
    await component.required.save();
    assert.strictEqual(component.required.text, 'Required: Required');
    assert.strictEqual(sequenceBlockModel.required, newVal);
  });

  test('change track', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.track.yesNoToggle.checked, 'true');
    await component.track.yesNoToggle.click();
    assert.strictEqual(component.track.yesNoToggle.checked, 'false');
    assert.false(sequenceBlockModel.track);
  });

  test('change child sequence order', async function (assert) {
    const newVal = 2;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.childSequenceOrder.text, 'Child Sequence Order: Ordered');
    await component.childSequenceOrder.edit();
    await component.childSequenceOrder.select(newVal);
    await component.childSequenceOrder.save();
    assert.strictEqual(component.childSequenceOrder.text, 'Child Sequence Order: Unordered');
    assert.strictEqual(sequenceBlockModel.childSequenceOrder, newVal);
  });

  test('change order in sequence', async function (assert) {
    const newVal = 2;
    const parent = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report: this.report,
      parent,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    this.server.create('curriculum-inventory-sequence-block', {
      orderInSequence: 2,
      report: this.report,
      parent,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.orderInSequence.text, 'Order in Sequence: 1');
    await component.orderInSequence.edit();
    assert.strictEqual(component.orderInSequence.options.length, 2);
    assert.strictEqual(component.orderInSequence.options[0].text, '1');
    assert.ok(component.orderInSequence.options[0].isSelected);
    assert.strictEqual(component.orderInSequence.options[1].text, '2');
    await component.orderInSequence.select(newVal);
    await component.orderInSequence.save();
    assert.strictEqual(component.orderInSequence.text, 'Order in Sequence: 2');
    assert.strictEqual(sequenceBlockModel.orderInSequence, newVal);
  });

  test('change starting academic level', async function (assert) {
    const newVal = 2;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.startLevel.text, 'Start Level: Year 1');
    await component.startLevel.edit();
    assert.strictEqual(component.startLevel.options.length, 10);
    assert.ok(component.startLevel.options[0].isSelected);
    await component.startLevel.select(newVal);
    await component.startLevel.save();
    assert.strictEqual(component.startLevel.text, `Start Level: Year 2`);
  });

  test('change ending academic level', async function (assert) {
    const newVal = 1;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.endLevel.text, 'End Level: Year 10');
    await component.endLevel.edit();
    assert.strictEqual(component.endLevel.options.length, 10);
    assert.ok(component.endLevel.options[9].isSelected);
    await component.endLevel.select(newVal);
    await component.endLevel.save();
    assert.strictEqual(component.endLevel.text, `End Level: Year 1`);
  });

  test('manage sessions', async function (assert) {
    const clerkshipType = this.server.create('course-clerkship-type', { title: 'Block' });
    const course = this.server.create('course', {
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType,
      level: 4,
      school: this.school,
    });
    const parentBlock = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
    });
    const ilmSessionType = this.server.create('session-type', { title: 'Independent Learning' });
    const ilmSession = this.server.create('ilm-session');
    this.server.create('session', {
      course,
      sessionType: ilmSessionType,
      ilmSession,
      published: true,
    });
    const lectureSessionType = this.server.create('session-type', { title: 'Lecture' });
    this.server.create('session', {
      course,
      sessionType: lectureSessionType,
      published: true,
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report: this.report,
      parent: parentBlock,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.notOk(component.sessionManager.isVisible);
    assert.ok(component.sessionList.isVisible);
    assert.ok(component.sessions.editButton.isVisible);
    await component.sessions.editButton.click();
    assert.ok(component.sessionManager.isVisible);
    assert.notOk(component.sessionList.isVisible);
    assert.notOk(component.sessions.isVisible);
  });

  test('read-only mode', async function (assert) {
    const clerkshipType = this.server.create('course-clerkship-type', { title: 'Block' });
    const course = this.server.create('course', {
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType,
      level: 4,
      school: this.school,
    });
    const parentBlock = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
    });
    const ilmSessionType = this.server.create('session-type', { title: 'Independent Learning' });
    const ilmSession = this.server.create('ilm-session');
    this.server.create('session', {
      course,
      title: 'Session A',
      sessionType: ilmSessionType,
      ilmSession,
      published: true,
    });
    const presentationSessionType = this.server.create('session-type', { title: 'Presentation' });
    this.server.create('session', {
      course,
      title: 'Session B',
      sessionType: presentationSessionType,
      published: true,
    });
    const lectureSessionType = this.server.create('session-type', { title: 'Lecture' });
    this.server.create('session', {
      course,
      title: 'Session C',
      sessionType: lectureSessionType,
      published: true,
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report: this.report,
      parent: parentBlock,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course,
      required: 3,
      track: true,
      minimum: 2,
      maximum: 15,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{false}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(
      component.description.text,
      `Description: ${sequenceBlockModel.description}`
    );
    assert.notOk(component.description.isEditable);
    assert.strictEqual(
      component.course.text,
      'Course: Course A Level: 4, Start Date: 2015-02-02, End Date: 2015-03-30 - Clerkship (Block)'
    );
    assert.notOk(component.course.isEditable);
    assert.strictEqual(component.startLevel.text, 'Start Level: Year 1');
    assert.notOk(component.startLevel.isEditable);
    assert.strictEqual(component.endLevel.text, 'End Level: Year 10');
    assert.notOk(component.endLevel.isEditable);
    assert.strictEqual(component.required.text, 'Required: Required In Track');
    assert.notOk(component.required.isEditable);
    assert.strictEqual(component.track.text, 'Is Track: Yes');
    assert.notOk(component.track.isEditable);
    assert.strictEqual(
      component.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.notOk(component.startDate.isEditable);
    assert.strictEqual(
      component.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.notOk(component.endDate.isEditable);
    assert.strictEqual(
      component.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    assert.notOk(component.duration.isEditable);
    assert.strictEqual(component.childSequenceOrder.text, 'Child Sequence Order: Ordered');
    assert.notOk(component.childSequenceOrder.isEditable);
    assert.strictEqual(
      component.orderInSequence.text,
      `Order in Sequence: ${sequenceBlockModel.orderInSequence}`
    );
    assert.notOk(component.orderInSequence.isEditable);
    assert.strictEqual(component.minimum.text, `Minimum: ${sequenceBlockModel.minimum}`);
    assert.notOk(component.minimum.isEditable);
    assert.strictEqual(component.maximum.text, `Maximum: ${sequenceBlockModel.maximum}`);
    assert.notOk(component.maximum.isEditable);
    assert.strictEqual(component.sessions.label, 'Sessions (3)');
    assert.notOk(component.sessions.editButton.isVisible);
    assert.notOk(component.sessionManager.isVisible);
    assert.strictEqual(component.sessionList.sessions.length, 3);
  });

  test('flagging block as elective sets minimum value to 0', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.minimum.text, 'Minimum: 10');
    assert.ok(component.minimum.isEditable);
    await component.required.edit();
    await component.required.select('2');
    assert.strictEqual(component.minimum.text, 'Minimum: 0');
    assert.notOk(component.minimum.isEditable);
  });

  test('selectives are indicated as such', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 10,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);
    assert.strictEqual(component.required.text, 'Required: Required');
    assert.strictEqual(component.minimum.text, 'Minimum: 10');
    assert.notOk(component.isSelective.isHidden);
    assert.strictEqual(
      component.isSelective.text,
      'This sequence block has been marked as a selective.'
    );
    await component.required.edit();
    await component.required.select('2'); // select "elective"
    assert.ok(component.isSelective.isHidden);
    await component.required.select('1'); // switch back to "required"
    assert.notOk(component.isSelective.isHidden);
    await component.minimum.edit();
    await component.minMaxEditor.minimum.set(sequenceBlockModel.maximum);
    await component.minMaxEditor.save();
    assert.strictEqual(component.minimum.text, 'Minimum: 20');
    assert.ok(component.isSelective.isHidden);
    await component.minimum.edit();
    await component.minMaxEditor.minimum.set('1');
    await component.minMaxEditor.save();
    assert.strictEqual(component.minimum.text, 'Minimum: 1');
    assert.notOk(component.isSelective.isHidden);
    await component.minimum.edit();
    await component.minMaxEditor.minimum.set('0');
    await component.minMaxEditor.save();
    assert.strictEqual(component.minimum.text, 'Minimum: 0');
    assert.ok(component.isSelective.isHidden);
  });

  test('edit minimum and maximum values, then save', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.minimum.text, 'Minimum: 10');
    assert.strictEqual(component.maximum.text, 'Maximum: 20');
    await component.minimum.edit();
    assert.strictEqual(component.minMaxEditor.minimum.value, '10');
    assert.strictEqual(component.minMaxEditor.maximum.value, '20');
    await component.minMaxEditor.minimum.set('111');
    await component.minMaxEditor.maximum.set('555');
    await component.minMaxEditor.save();
    assert.strictEqual(component.minimum.text, 'Minimum: 111');
    assert.strictEqual(component.maximum.text, 'Maximum: 555');
  });

  test('edit minimum and maximum values, then cancel', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.minimum.text, 'Minimum: 10');
    assert.strictEqual(component.maximum.text, 'Maximum: 20');
    await component.minimum.edit();
    assert.strictEqual(component.minMaxEditor.minimum.value, '10');
    assert.strictEqual(component.minMaxEditor.maximum.value, '20');
    await component.minMaxEditor.minimum.set('111');
    await component.minMaxEditor.maximum.set('555');
    await component.minMaxEditor.cancel();
    assert.strictEqual(component.minimum.text, 'Minimum: 10');
    assert.strictEqual(component.maximum.text, 'Maximum: 20');
  });

  test('save fails when minimum is larger than maximum', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.minimum.edit();
    assert.strictEqual(component.minMaxEditor.maximum.errors.length, 0);
    await component.minMaxEditor.minimum.set('100');
    await component.minMaxEditor.maximum.set('50');
    await component.minMaxEditor.save();
    assert.strictEqual(component.minMaxEditor.maximum.errors.length, 1);
    assert.strictEqual(
      component.minMaxEditor.maximum.errors[0].text,
      'Maximum must be greater than or equal to Minimum'
    );
  });

  test('save fails when minimum is less than zero', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.minimum.edit();
    assert.strictEqual(component.minMaxEditor.minimum.errors.length, 0);
    await component.minMaxEditor.minimum.set('-1');
    await component.minMaxEditor.save();
    assert.strictEqual(component.minMaxEditor.minimum.errors.length, 1);
  });

  test('save fails when minimum is empty', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.minimum.edit();
    assert.strictEqual(component.minMaxEditor.minimum.errors.length, 0);
    await component.minMaxEditor.minimum.set('');
    await component.minMaxEditor.save();
    assert.strictEqual(component.minMaxEditor.minimum.errors.length, 1);
  });

  test('save fails when maximum is empty', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.maximum.edit();
    assert.strictEqual(component.minMaxEditor.maximum.errors.length, 0);
    await component.minMaxEditor.maximum.set('');
    await component.minMaxEditor.save();
    assert.strictEqual(component.minMaxEditor.maximum.errors.length, 1);
  });

  test('minimum field is set to 0 and disabled for electives', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.notOk(component.minimum.isEditable);
    await component.maximum.edit();
    assert.strictEqual(component.minMaxEditor.minimum.value, '0');
    assert.ok(component.minMaxEditor.minimum.isDisabled);
  });

  test('edit duration and start/end date, then save', async function (assert) {
    const newStartDate = new Date('2016-10-30T00:00:00');
    const newEndDate = new Date('2016-11-02T00:00:00');
    const newDuration = 15;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.startDate.edit();
    await component.durationEditor.startDate.set(newStartDate);
    await component.durationEditor.endDate.set(newEndDate);
    await component.durationEditor.duration.set(newDuration);
    await component.durationEditor.save();
    assert.strictEqual(
      component.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.startDate.isEditable);
    assert.strictEqual(
      component.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.ok(component.endDate.isEditable);
    assert.strictEqual(
      component.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    assert.strictEqual(newStartDate.getTime(), sequenceBlockModel.startDate.getTime());
    assert.strictEqual(newEndDate.getTime(), sequenceBlockModel.endDate.getTime());
    assert.strictEqual(newDuration, sequenceBlockModel.duration);
  });

  test('save with date range and a zero duration', async function (assert) {
    const newStartDate = new Date('2016-10-30T00:00:00');
    const newEndDate = new Date('2016-11-02T00:00:00');
    const newDuration = 0;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.startDate.edit();
    await component.durationEditor.startDate.set(newStartDate);
    await component.durationEditor.endDate.set(newEndDate);
    await component.durationEditor.duration.set(newDuration);
    await component.durationEditor.save();
    assert.strictEqual(
      component.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.startDate.isEditable);
    assert.strictEqual(
      component.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.strictEqual(component.duration.text, `Duration (in Days): Click to edit`);
    assert.strictEqual(newStartDate.getTime(), sequenceBlockModel.startDate.getTime());
    assert.strictEqual(newEndDate.getTime(), sequenceBlockModel.endDate.getTime());
    assert.strictEqual(newDuration, sequenceBlockModel.duration);
  });

  test('save with non-zero duration and no date range', async function (assert) {
    const newDuration = 10;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.startDate.edit();
    await component.durationEditor.duration.set(newDuration);
    await component.durationEditor.save();
    assert.strictEqual(component.startDate.text, 'Start: Click to edit');
    assert.ok(component.startDate.isEditable);
    assert.strictEqual(component.endDate.text, 'End: Click to edit');
    assert.ok(component.endDate.isEditable);
    assert.strictEqual(
      component.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    assert.strictEqual(sequenceBlockModel.startDate, null);
    assert.strictEqual(sequenceBlockModel.endDate, null);
    assert.strictEqual(newDuration, sequenceBlockModel.duration);
  });

  test('edit duration and start/end date, then cancel', async function (assert) {
    const newStartDate = new Date('2016-10-30T00:00:00');
    const newEndDate = new Date('2016-11-02T00:00:00');
    const newDuration = 20;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(
      component.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.startDate.isEditable);
    assert.strictEqual(
      component.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.strictEqual(
      component.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    await component.startDate.edit();
    await component.durationEditor.startDate.set(newStartDate);
    await component.durationEditor.endDate.set(newEndDate);
    await component.durationEditor.duration.set(newDuration);
    await component.durationEditor.cancel();
    assert.strictEqual(
      component.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.startDate.isEditable);
    assert.strictEqual(
      component.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.strictEqual(
      component.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
  });

  test('save fails if end-date is older than start-date', async function (assert) {
    const newStartDate = new Date('2016-10-30T00:00:00');
    const newEndDate = new Date('2013-11-02T00:00:00');
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.endDate.edit();
    assert.strictEqual(component.durationEditor.endDate.errors.length, 0);
    await component.durationEditor.startDate.set(newStartDate);
    await component.durationEditor.endDate.set(newEndDate);
    await component.durationEditor.save();
    assert.strictEqual(component.durationEditor.endDate.errors.length, 1);
  });

  test('save fails on missing duration', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.duration.edit();
    assert.strictEqual(component.durationEditor.duration.errors.length, 0);
    await component.durationEditor.duration.set('');
    await component.durationEditor.save();
    assert.strictEqual(component.durationEditor.duration.errors.length, 2);
  });

  test('save fails on invalid duration', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.duration.edit();
    assert.strictEqual(component.durationEditor.duration.errors.length, 0);
    await component.durationEditor.duration.set('-10');
    await component.durationEditor.save();
    assert.strictEqual(component.durationEditor.duration.errors.length, 1);
  });

  test('save fails if neither date range nor duration is provided', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: null,
      endDate: null,
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.duration.edit();
    assert.strictEqual(component.durationEditor.startDate.errors.length, 0);
    assert.strictEqual(component.durationEditor.endDate.errors.length, 0);
    assert.strictEqual(component.durationEditor.duration.errors.length, 0);
    await component.durationEditor.duration.set('');
    await component.durationEditor.save();
    assert.strictEqual(component.durationEditor.startDate.errors.length, 1);
    assert.strictEqual(component.durationEditor.duration.errors.length, 2);
  });

  test('save fails if linked course is clerkship and start date is not provided', async function (assert) {
    const clerkshipType = this.server.create('course-clerkship-type', { title: 'Block' });
    const course = this.server.create('course', {
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType,
      level: 4,
      school: this.school,
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      course,
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.duration.edit();
    assert.strictEqual(component.durationEditor.startDate.errors.length, 0);
    assert.strictEqual(component.durationEditor.endDate.errors.length, 0);
    assert.strictEqual(component.durationEditor.duration.errors.length, 0);
    await component.durationEditor.startDate.set(null);
    await component.durationEditor.endDate.set(null);
    await component.durationEditor.save();
    assert.strictEqual(component.durationEditor.startDate.errors.length, 1);
    assert.strictEqual(component.durationEditor.endDate.errors.length, 0);
    assert.strictEqual(component.durationEditor.duration.errors.length, 0);
  });

  test('save fails if linked course is clerkship and duration is zero', async function (assert) {
    const clerkshipType = this.server.create('course-clerkship-type', { title: 'Block' });
    const course = this.server.create('course', {
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType,
      level: 4,
      school: this.school,
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      course,
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.duration.edit();
    assert.strictEqual(component.durationEditor.startDate.errors.length, 0);
    assert.strictEqual(component.durationEditor.endDate.errors.length, 0);
    assert.strictEqual(component.durationEditor.duration.errors.length, 0);
    await component.durationEditor.duration.set('0');
    await component.durationEditor.save();
    assert.strictEqual(component.durationEditor.startDate.errors.length, 0);
    assert.strictEqual(component.durationEditor.endDate.errors.length, 0);
    assert.strictEqual(component.durationEditor.duration.errors.length, 1);
    assert.strictEqual(
      component.durationEditor.duration.errors[0].text,
      'Duration must be greater than or equal to 1'
    );
  });

  test('save fails if start-date is given but no end-date is provided', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: null,
      endDate: null,
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    await component.startDate.edit();
    assert.strictEqual(component.durationEditor.endDate.errors.length, 0);
    await component.durationEditor.startDate.set(new Date());
    await component.durationEditor.save();
    assert.strictEqual(component.durationEditor.endDate.errors.length, 2);
  });

  test('cancel editing on escape in minimum input', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 5,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.ok(component.minimum.text, 'Minimum: 5');
    await component.minimum.edit();
    await component.minMaxEditor.minimum.set('2');
    await component.minMaxEditor.minimum.cancel();
    assert.notOk(component.minMaxEditor.isVisible);
    assert.ok(component.minimum.text, 'Minimum: 5');
  });

  test('save on enter in minimum input', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 5,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.ok(component.minimum.text, 'Minimum: 5');
    await component.minimum.edit();
    await component.minMaxEditor.minimum.set('2');
    await component.minMaxEditor.minimum.save();
    assert.notOk(component.minMaxEditor.isVisible);
    assert.ok(component.minimum.text, 'Minimum: 2');
  });

  test('cancel editing on escape in maximum input', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 5,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.ok(component.maximum.text, 'Maximum: 20');
    await component.maximum.edit();
    await component.minMaxEditor.maximum.set('100');
    await component.minMaxEditor.minimum.cancel();
    assert.notOk(component.minMaxEditor.isVisible);
    assert.ok(component.maximum.text, 'Minimum: 20');
  });

  test('save on enter in maximum input', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 5,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.ok(component.maximum.text, 'Maximum: 20');
    await component.maximum.edit();
    await component.minMaxEditor.maximum.set('100');
    await component.minMaxEditor.minimum.save();
    assert.notOk(component.minMaxEditor.isVisible);
    assert.ok(component.maximum.text, 'Minimum: 100');
  });

  test('cancel editing on escape in duration input', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 5,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.ok(component.duration.text, 'Duration: 5');
    await component.duration.edit();
    await component.durationEditor.duration.set('100');
    await component.durationEditor.duration.cancel();
    assert.notOk(component.durationEditor.isVisible);
    assert.ok(component.duration.text, 'Duration: 5');
  });

  test('save on enter in duration input', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 5,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.ok(component.duration.text, 'Duration: 5');
    await component.duration.edit();
    await component.durationEditor.duration.set('100');
    await component.durationEditor.duration.save();
    assert.notOk(component.durationEditor.isVisible);
    assert.ok(component.duration.text, 'Duration: 100');
  });

  test('manage-sessions button is not available if no course is linked', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 5,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.sessions.label, 'Sessions (0)');
    assert.notOk(component.sessions.editButton.isVisible);
  });

  test('manage-sessions button is not available if linked course has no sessions', async function (assert) {
    const course = this.server.create('course', { school: this.school });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 5,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 5,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
      course,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{true}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.sessions.label, 'Sessions (0)');
    assert.notOk(component.sessions.editButton.isVisible);
  });

  test('zero duration renders as n/a in read-only mode', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[9],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    const sequenceBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');

    await render(hbs`<CurriculumInventory::SequenceBlockOverview
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{false}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.duration.text, 'Duration (in Days): n/a');
  });
});
