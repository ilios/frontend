import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-overview';

module('Integration | Component | curriculum-inventory/sequence-block-overview', function (hooks) {
  setupRenderingTest(hooks);
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
    const academicLevel = this.academicLevels[0];
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
      academicLevel,
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
      @setSortBy={{noop}}
    />`);

    assert.equal(
      component.overview.description.text,
      `Description: ${sequenceBlockModel.description}`
    );
    assert.ok(component.overview.description.isEditable);
    assert.equal(
      component.overview.course.text,
      'Course: Course A Level: 4, Start Date: 2015-02-02, End Date: 2015-03-30 - Clerkship (Block)'
    );
    assert.ok(component.overview.course.isEditable);
    const level = await sequenceBlockModel.academicLevel;
    assert.equal(component.overview.academicLevel.text, `Academic Level: ${level.name}`);
    assert.ok(component.overview.academicLevel.isEditable);
    assert.equal(component.overview.required.text, 'Required: Required In Track');
    assert.ok(component.overview.required.isEditable);
    assert.equal(component.overview.track.label, 'Is Track:');
    assert.ok(component.overview.track.isTrack);
    assert.ok(component.overview.track.isEditable);
    assert.equal(
      component.overview.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.overview.startDate.isEditable);
    assert.equal(
      component.overview.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.ok(component.overview.endDate.isEditable);
    assert.equal(
      component.overview.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    assert.ok(component.overview.duration.isEditable);
    assert.equal(component.overview.childSequenceOrder.text, 'Child Sequence Order: Ordered');
    assert.ok(component.overview.childSequenceOrder.isEditable);
    assert.equal(
      component.overview.orderInSequence.text,
      `Order in Sequence: ${sequenceBlockModel.orderInSequence}`
    );
    assert.ok(component.overview.orderInSequence.isEditable);
    assert.equal(component.overview.minimum.text, `Minimum: ${sequenceBlockModel.minimum}`);
    assert.ok(component.overview.minimum.isEditable);
    assert.equal(component.overview.maximum.text, `Maximum: ${sequenceBlockModel.maximum}`);
    assert.ok(component.overview.maximum.isEditable);
    assert.equal(component.overview.sessions.label, 'Sessions (3)');
    assert.ok(component.overview.sessions.editButton.isVisible);
    assert.notOk(component.sessionManager.isVisible);
    assert.equal(component.sessionList.sessions.length, 3);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.orderInSequence.text, 'Order in Sequence: n/a');
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.orderInSequence.text, 'Order in Sequence: n/a');
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(
      component.overview.course.text,
      'Course: Alpha Level: 1, Start Date: 2016-01-01, End Date: 2016-01-02 - Clerkship (clerkship type 0)'
    );
    await component.overview.course.edit();
    assert.equal(component.overview.course.options.length, 4);
    assert.equal(component.overview.course.options[0].text, 'Select a Course');
    assert.equal(component.overview.course.options[1].text, 'Alpha');
    assert.equal(
      component.overview.course.details,
      'Level: 1, Start Date: 2016-01-01, End Date: 2016-01-02 - Clerkship (clerkship type 0)'
    );
    assert.equal(component.overview.course.options[1].value, courseModel.id);
    assert.ok(component.overview.course.options[1].isSelected);
    assert.equal(component.overview.course.options[2].text, 'Beta');
    assert.equal(component.overview.course.options[3].text, 'Gamma');
    await component.overview.course.select(newCourseModel.id);
    assert.equal(
      component.overview.course.details,
      'Level: 1, Start Date: 2016-03-01, End Date: 2016-03-02 - Clerkship (clerkship type 0)'
    );
    await component.overview.course.save();
    assert.equal(
      component.overview.course.text,
      'Course: Gamma Level: 1, Start Date: 2016-03-01, End Date: 2016-03-02 - Clerkship (clerkship type 0)'
    );
    const blockCourse = await sequenceBlockModel.course;
    assert.equal(blockCourse.id, newCourse.id);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.description.text, 'Description: Click to add a description.');
    await component.overview.description.edit();
    await component.overview.description.set(newDescription);
    await component.overview.description.save();
    assert.equal(component.overview.description.text, `Description: ${newDescription}`);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.required.text, 'Required: Optional (elective)');
    await component.overview.required.edit();
    await component.overview.required.select(newVal);
    await component.overview.required.save();
    assert.equal(component.overview.required.text, 'Required: Required');
    assert.equal(sequenceBlockModel.required, newVal);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.ok(component.overview.track.isTrack);
    await component.overview.track.toggle();
    assert.notOk(component.overview.track.isTrack);
    assert.equal(sequenceBlockModel.track, false);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.childSequenceOrder.text, 'Child Sequence Order: Ordered');
    await component.overview.childSequenceOrder.edit();
    await component.overview.childSequenceOrder.select(newVal);
    await component.overview.childSequenceOrder.save();
    assert.equal(component.overview.childSequenceOrder.text, 'Child Sequence Order: Unordered');
    assert.equal(sequenceBlockModel.childSequenceOrder, newVal);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.orderInSequence.text, 'Order in Sequence: 1');
    await component.overview.orderInSequence.edit();
    assert.equal(component.overview.orderInSequence.options.length, 2);
    assert.equal(component.overview.orderInSequence.options[0].text, '1');
    assert.ok(component.overview.orderInSequence.options[0].isSelected);
    assert.equal(component.overview.orderInSequence.options[1].text, '2');
    await component.overview.orderInSequence.select(newVal);
    await component.overview.orderInSequence.save();
    assert.equal(component.overview.orderInSequence.text, 'Order in Sequence: 2');
    assert.equal(sequenceBlockModel.orderInSequence, newVal);
  });

  test('change academic level', async function (assert) {
    const newVal = 9;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: this.academicLevels[1],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.academicLevel.text, 'Academic Level: Year 1');
    await component.overview.academicLevel.edit();
    assert.equal(component.overview.academicLevel.options.length, 10);
    assert.ok(component.overview.academicLevel.options[1].isSelected);
    await component.overview.academicLevel.select(newVal);
    await component.overview.academicLevel.save();
    assert.equal(component.overview.academicLevel.text, `Academic Level: Year ${newVal - 1}`);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.notOk(component.sessionManager.isVisible);
    assert.ok(component.sessionList.isVisible);
    assert.ok(component.overview.sessions.editButton.isVisible);
    await component.overview.sessions.editButton.click();
    assert.ok(component.sessionManager.isVisible);
    assert.notOk(component.sessionList.isVisible);
    assert.notOk(component.overview.sessions.isVisible);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(
      component.overview.description.text,
      `Description: ${sequenceBlockModel.description}`
    );
    assert.notOk(component.overview.description.isEditable);
    assert.equal(
      component.overview.course.text,
      'Course: Course A Level: 4, Start Date: 2015-02-02, End Date: 2015-03-30 - Clerkship (Block)'
    );
    assert.notOk(component.overview.course.isEditable);
    const level = await sequenceBlockModel.academicLevel;
    assert.equal(component.overview.academicLevel.text, `Academic Level: ${level.name}`);
    assert.notOk(component.overview.academicLevel.isEditable);
    assert.equal(component.overview.required.text, 'Required: Required In Track');
    assert.notOk(component.overview.required.isEditable);
    assert.equal(component.overview.track.text, 'Is Track: Yes');
    assert.notOk(component.overview.track.isEditable);
    assert.equal(
      component.overview.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.notOk(component.overview.startDate.isEditable);
    assert.equal(
      component.overview.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.notOk(component.overview.endDate.isEditable);
    assert.equal(
      component.overview.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    assert.notOk(component.overview.duration.isEditable);
    assert.equal(component.overview.childSequenceOrder.text, 'Child Sequence Order: Ordered');
    assert.notOk(component.overview.childSequenceOrder.isEditable);
    assert.equal(
      component.overview.orderInSequence.text,
      `Order in Sequence: ${sequenceBlockModel.orderInSequence}`
    );
    assert.notOk(component.overview.orderInSequence.isEditable);
    assert.equal(component.overview.minimum.text, `Minimum: ${sequenceBlockModel.minimum}`);
    assert.notOk(component.overview.minimum.isEditable);
    assert.equal(component.overview.maximum.text, `Maximum: ${sequenceBlockModel.maximum}`);
    assert.notOk(component.overview.maximum.isEditable);
    assert.equal(component.overview.sessions.label, 'Sessions (3)');
    assert.notOk(component.overview.sessions.editButton.isVisible);
    assert.notOk(component.sessionManager.isVisible);
    assert.equal(component.sessionList.sessions.length, 3);
  });

  test('flagging block as elective sets minimum value to 0', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.minimum.text, 'Minimum: 10');
    assert.ok(component.overview.minimum.isEditable);
    await component.overview.required.edit();
    await component.overview.required.select('2');
    assert.equal(component.overview.minimum.text, 'Minimum: 0');
    assert.notOk(component.overview.minimum.isEditable);
  });

  test('selectives are indicated as such', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.required.text, 'Required: Required');
    assert.equal(component.overview.minimum.text, 'Minimum: 10');
    assert.notOk(component.overview.isSelective.isHidden);
    assert.equal(
      component.overview.isSelective.text,
      'This sequence block has been marked as a selective.'
    );
    await component.overview.required.edit();
    await component.overview.required.select('2'); // select "elective"
    assert.ok(component.overview.isSelective.isHidden);
    await component.overview.required.select('1'); // switch back to "required"
    assert.notOk(component.overview.isSelective.isHidden);
    await component.overview.minimum.edit();
    await component.overview.minMaxEditor.minimum.set(sequenceBlockModel.maximum);
    await component.overview.minMaxEditor.save();
    assert.equal(component.overview.minimum.text, 'Minimum: 20');
    assert.ok(component.overview.isSelective.isHidden);
    await component.overview.minimum.edit();
    await component.overview.minMaxEditor.minimum.set('1');
    await component.overview.minMaxEditor.save();
    assert.equal(component.overview.minimum.text, 'Minimum: 1');
    assert.notOk(component.overview.isSelective.isHidden);
    await component.overview.minimum.edit();
    await component.overview.minMaxEditor.minimum.set('0');
    await component.overview.minMaxEditor.save();
    assert.equal(component.overview.minimum.text, 'Minimum: 0');
    assert.ok(component.overview.isSelective.isHidden);
  });

  test('edit minimum and maximum values, then save', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.minimum.text, 'Minimum: 10');
    assert.equal(component.overview.maximum.text, 'Maximum: 20');
    await component.overview.minimum.edit();
    assert.equal(component.overview.minMaxEditor.minimum.value, '10');
    assert.equal(component.overview.minMaxEditor.maximum.value, '20');
    await component.overview.minMaxEditor.minimum.set('111');
    await component.overview.minMaxEditor.maximum.set('555');
    await component.overview.minMaxEditor.save();
    assert.equal(component.overview.minimum.text, 'Minimum: 111');
    assert.equal(component.overview.maximum.text, 'Maximum: 555');
  });

  test('edit minimum and maximum values, then cancel', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(component.overview.minimum.text, 'Minimum: 10');
    assert.equal(component.overview.maximum.text, 'Maximum: 20');
    await component.overview.minimum.edit();
    assert.equal(component.overview.minMaxEditor.minimum.value, '10');
    assert.equal(component.overview.minMaxEditor.maximum.value, '20');
    await component.overview.minMaxEditor.minimum.set('111');
    await component.overview.minMaxEditor.maximum.set('555');
    await component.overview.minMaxEditor.cancel();
    assert.equal(component.overview.minimum.text, 'Minimum: 10');
    assert.equal(component.overview.maximum.text, 'Maximum: 20');
  });

  test('save fails when minimum is larger than maximum', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.minimum.edit();
    assert.notOk(component.overview.minMaxEditor.maximum.hasError);
    await component.overview.minMaxEditor.minimum.set('100');
    await component.overview.minMaxEditor.maximum.set('50');
    await component.overview.minMaxEditor.save();
    assert.ok(component.overview.minMaxEditor.maximum.hasError);
  });

  test('save fails when minimum is less than zero', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.minimum.edit();
    assert.notOk(component.overview.minMaxEditor.minimum.hasError);
    await component.overview.minMaxEditor.minimum.set('-1');
    await component.overview.minMaxEditor.save();
    assert.ok(component.overview.minMaxEditor.minimum.hasError);
  });

  test('save fails when minimum is empty', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 10,
      maximum: 20,
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.minimum.edit();
    assert.notOk(component.overview.minMaxEditor.minimum.hasError);
    await component.overview.minMaxEditor.minimum.set('');
    await component.overview.minMaxEditor.save();
    assert.ok(component.overview.minMaxEditor.minimum.hasError);
  });

  test('save fails when maximum is empty', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 1,
      track: true,
      minimum: 0,
      maximum: 20,
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.maximum.edit();
    assert.notOk(component.overview.minMaxEditor.maximum.hasError);
    await component.overview.minMaxEditor.maximum.set('');
    await component.overview.minMaxEditor.save();
    assert.ok(component.overview.minMaxEditor.maximum.hasError);
  });

  test('minimum field is set to 0 and disabled for electives', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      duration: 10,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 20,
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.notOk(component.overview.minimum.isEditable);
    await component.overview.maximum.edit();
    assert.equal(component.overview.minMaxEditor.minimum.value, '0');
    assert.ok(component.overview.minMaxEditor.minimum.isDisabled);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.startDate.edit();
    await component.overview.durationEditor.startDate.set(newStartDate);
    await component.overview.durationEditor.endDate.set(newEndDate);
    await component.overview.durationEditor.duration.set(newDuration);
    await component.overview.durationEditor.save();
    assert.equal(
      component.overview.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.overview.startDate.isEditable);
    assert.equal(
      component.overview.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.ok(component.overview.endDate.isEditable);
    assert.equal(
      component.overview.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    assert.equal(newStartDate.getTime(), sequenceBlockModel.startDate.getTime());
    assert.equal(newEndDate.getTime(), sequenceBlockModel.endDate.getTime());
    assert.equal(newDuration, sequenceBlockModel.duration);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.startDate.edit();
    await component.overview.durationEditor.startDate.set(newStartDate);
    await component.overview.durationEditor.endDate.set(newEndDate);
    await component.overview.durationEditor.duration.set(newDuration);
    await component.overview.durationEditor.save();
    assert.equal(
      component.overview.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.overview.startDate.isEditable);
    assert.equal(
      component.overview.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.equal(
      component.overview.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    assert.equal(newStartDate.getTime(), sequenceBlockModel.startDate.getTime());
    assert.equal(newEndDate.getTime(), sequenceBlockModel.endDate.getTime());
    assert.equal(newDuration, sequenceBlockModel.duration);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.startDate.edit();
    await component.overview.durationEditor.duration.set(newDuration);
    await component.overview.durationEditor.save();
    assert.equal(component.overview.startDate.text, 'Start: Click to edit');
    assert.ok(component.overview.startDate.isEditable);
    assert.equal(component.overview.endDate.text, 'End: Click to edit');
    assert.ok(component.overview.endDate.isEditable);
    assert.equal(
      component.overview.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    assert.equal(null, sequenceBlockModel.startDate);
    assert.equal(null, sequenceBlockModel.endDate);
    assert.equal(newDuration, sequenceBlockModel.duration);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    assert.equal(
      component.overview.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.overview.startDate.isEditable);
    assert.equal(
      component.overview.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.equal(
      component.overview.duration.text,
      `Duration (in Days): ${sequenceBlockModel.duration}`
    );
    await component.overview.startDate.edit();
    await component.overview.durationEditor.startDate.set(newStartDate);
    await component.overview.durationEditor.endDate.set(newEndDate);
    await component.overview.durationEditor.duration.set(newDuration);
    await component.overview.durationEditor.cancel();
    assert.equal(
      component.overview.startDate.text,
      'Start: ' + moment(sequenceBlockModel.startDate).format('L')
    );
    assert.ok(component.overview.startDate.isEditable);
    assert.equal(
      component.overview.endDate.text,
      'End: ' + moment(sequenceBlockModel.endDate).format('L')
    );
    assert.equal(
      component.overview.duration.text,
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.endDate.edit();
    assert.notOk(component.overview.durationEditor.endDate.hasError);
    await component.overview.durationEditor.startDate.set(newStartDate);
    await component.overview.durationEditor.endDate.set(newEndDate);
    await component.overview.durationEditor.save();
    assert.ok(component.overview.durationEditor.endDate.hasError);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.duration.edit();
    assert.notOk(component.overview.durationEditor.duration.hasError);
    await component.overview.durationEditor.duration.set('');
    await component.overview.durationEditor.save();
    assert.ok(component.overview.durationEditor.duration.hasError);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.duration.edit();
    assert.notOk(component.overview.durationEditor.duration.hasError);
    await component.overview.durationEditor.duration.set('-10');
    await component.overview.durationEditor.save();
    assert.ok(component.overview.durationEditor.duration.hasError);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.duration.edit();
    assert.notOk(component.overview.durationEditor.startDate.hasError);
    assert.notOk(component.overview.durationEditor.endDate.hasError);
    assert.notOk(component.overview.durationEditor.duration.hasError);
    await component.overview.durationEditor.duration.set('');
    await component.overview.durationEditor.save();
    assert.ok(component.overview.durationEditor.startDate.hasError);
    assert.ok(component.overview.durationEditor.endDate.hasError);
    assert.ok(component.overview.durationEditor.duration.hasError);
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
      academicLevel: this.academicLevels[0],
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
      @setSortBy={{noop}}
    />`);

    await component.overview.startDate.edit();
    assert.notOk(component.overview.durationEditor.endDate.hasError);
    await component.overview.durationEditor.startDate.set(new Date());
    await component.overview.durationEditor.save();
    assert.ok(component.overview.durationEditor.endDate.hasError);
  });
});
