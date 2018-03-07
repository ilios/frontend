import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import initializer from "ilios/instance-initializers/load-common-translations";

const { resolve } = RSVP;

let storeMock;

module('Integration | Component | curriculum inventory sequence block overview', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      initializer.initialize(this.owner);
    };
  });

  hooks.beforeEach(function() {
    storeMock = Service.extend({});
    this.owner.register('service:store', storeMock);
  });

  test('it renders', async function(assert) {
    assert.expect(38);

    let school = EmberObject.create({ id() { return 1; }});

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      }
    });

    let linkedCourse = EmberObject.create({
      id: 1,
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType: EmberObject.create({ title: 'Block' }),
      level: 4
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([linkedCourse]),
      isFinalized: resolve(false)
    });

    let parentBlock = EmberObject.create({
      id: 1,
      isOrdered: true,
      children: null,
    });

    let academicLevel = academicLevels[0];

    let ilmSession = EmberObject.create({
      id: 1,
      course: resolve(linkedCourse),
      title: 'Session A',
      ilms: resolve([]),
      offerings: resolve([]),
      belongsTo(what) {
        if ('ilmSession' === what) {
          return {
            id() {
              return 1;
            }
          };
        }
      },
      sessionType: EmberObject.create({
        'title': 'Independent Learning'
      }),
      maxSingleOfferingDuration: resolve(10),
      totalSumOfferingsDuration: resolve(20)
    });

    let session1 = EmberObject.create({
      id: 1,
      course: resolve(linkedCourse),
      title: 'Session B',
      ilms: resolve([]),
      offerings: resolve([]),
      belongsTo(what) {
        if ('ilmSession' === what) {
          return {
            id() {
              return null;
            }
          };
        }
      },
      sessionType: resolve(EmberObject.create({
        'title': 'Presentation'
      })),
      maxSingleOfferingDuration: resolve(10),
      totalSumOfferingsDuration: resolve(20)
    });

    let session2 = EmberObject.create({
      id: 2,
      course: resolve(linkedCourse),
      title: 'Session C',
      ilms: resolve([]),
      offerings: resolve([]),
      belongsTo(what) {
        if ('ilmSession' === what) {
          return {
            id() {
              return null;
            }
          };
        }
      },
      sessionType: resolve(EmberObject.create({
        'title': 'Lecture'
      }))
    });

    linkedCourse.set('sessions', resolve([session1, session2, ilmSession]));

    let block = EmberObject.create({
      id: 2,
      description: 'lorem ipsum',
      report: resolve(report),
      parent: resolve(parentBlock),
      sessions: resolve([]),
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course: resolve(linkedCourse),
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel: resolve(academicLevel)
    });

    parentBlock.set('children', resolve([ block ]));

    let linkableCourses = [ linkedCourse ];

    storeMock.reopen({
      query(what, params){
        if ('course' === what) {
          assert.equal(params.filters.school[0], school.id());
          assert.equal(params.filters.published, true);
          assert.equal(params.filters.year, report.get('year'));
          return resolve(linkableCourses);
        } else if ('session' === what) {
          assert.equal(params.filters.course, linkedCourse.get('id'));
          assert.equal(params.filters.published, true);
          return resolve([session1, session2, ilmSession]);
        }
      },
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', null);

    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(() => {
      assert.equal(find('.description label').textContent.trim(), 'Description:', 'Description label is correct.');
      assert.equal(
        find('.description .editinplace').textContent.trim(), block.get('description'),
        'Block description is visible.'
      );
      assert.equal(find('.course label').textContent.trim(), 'Course:', 'Course label is correct.');
      assert.equal(find('.course .editinplace').textContent.trim(), linkedCourse.get('title'), 'Course title is visible.');
      let details = find('[data-test-course-details]').textContent.trim();
      assert.ok(details.indexOf('Level: ' + linkedCourse.get('level')) === 0, 'Level of linked course is visible.');
      assert.ok(
        details.indexOf('Start Date: ' + moment(linkedCourse.get('startDate')).format('YYYY-MM-DD')) > 0,
        'Start date of linked course is visible.'
      );
      assert.ok(
        details.indexOf('End Date: ' + moment(linkedCourse.get('endDate')).format('YYYY-MM-DD')) > 0,
        'End date of linked course is visible.'
      );
      assert.ok(
        details.indexOf('Clerkship (' + linkedCourse.get('clerkshipType').get('title') + ')') > 0,
        'Clerkship-type of linked course is visible.'
      );
      assert.equal(find('.description label').textContent.trim(), 'Description:', 'Description label is correct.');
      assert.equal(find('.description .editinplace').textContent.trim(), block.get('description'), 'Description is visible.');
      assert.equal(find('.required label').textContent.trim(), 'Required:', 'Required label is correct.');
      assert.equal(find('.required .editinplace').textContent.trim(), 'Optional (elective)', 'Required is visible.');
      assert.equal(find('.track label').textContent.trim(), 'Is Track:', 'Track label is correct.');
      assert.ok(find('.track input').checked, 'Track toggle is set to "yes"');
      assert.equal(find('.start-date label').textContent.trim(), 'Start:', 'Start date label is correct.');
      assert.equal(
        find('.start-date .editinplace').textContent.trim(), moment(block.get('startDate')).format('L'),
        'Start date is visible.'
      );
      assert.equal(find('.end-date label').textContent.trim(), 'End:', 'End date label is correct.');
      assert.equal(
        find('.end-date .editinplace').textContent.trim(), moment(block.get('endDate')).format('L'),
        'End date is visible.'
      );
      assert.equal(find('.duration label').textContent.trim(), 'Duration (in Days):', 'Duration label is correct.');
      assert.equal(find('.duration .editinplace').textContent.trim(), block.get('duration'), 'Duration is visible.');
      assert.equal(
        find('.child-sequence-order label').textContent.trim(), 'Child Sequence Order:',
        'Child sequence order label is correct.'
      );
      assert.equal(
        find('.child-sequence-order .editinplace').textContent.trim(), 'Ordered',
        'Child sequence order is visible.'
      );
      assert.equal(
        find('.order-in-sequence label').textContent.trim(), 'Order in Sequence:',
        'Order in sequence label is visible.'
      );
      assert.equal(
        find('.order-in-sequence .editinplace').textContent.trim(), block.get('orderInSequence'), 'Order in sequence is visible.'
      );
      assert.equal(find('.selective label').textContent.trim(), 'Is Selective?', 'Is Selective label correct.');
      assert.equal(find('.minimum label').textContent.trim(), 'Minimum:', 'Minimum label is correct.');
      assert.equal(find('.minimum .editinplace').textContent.trim(), block.get('minimum'), 'Minimum is visible.');
      assert.equal(find('.maximum label').textContent.trim(), 'Maximum:', 'Maximum label is correct.');
      assert.equal(find('.maximum .editinplace').textContent.trim(), block.get('maximum'), 'Maximum is visible.');
      assert.equal(find('.academic-level label').textContent.trim(), 'Academic Level:', 'Academic level label is correct.');
      assert.equal(find('.academic-level .editinplace').textContent.trim(), academicLevel.get('name'), 'Academic level is visible.');
      assert.equal(find('.sessions label').textContent.trim(), 'Sessions (2)', 'List is labeled with number of linkable sessions');
      assert.equal(find('.sessions .actions button').textContent.trim(), 'Manage', 'Manage button for sessions is visible.');
      // we're just going to peak at the list items here,
      // any other tests are performed in the respective integration test for the list component.
      assert.equal(findAll('.curriculum-inventory-sequence-block-session-list tbody tr').length, 2,
        'All linkable sessions are visible'
      );
      assert.equal(
        find(
          findAll('.curriculum-inventory-sequence-block-session-list tbody tr:eq(0) td')[1]
        ).textContent.trim(), 'Session B',
        'Sessions are sorted by title.'
      );
      assert.equal(
        find(
          findAll('.curriculum-inventory-sequence-block-session-list tbody tr:eq(1) td')[1]
        ).textContent.trim(), 'Session C',
        'Sessions are sorted by title.'
      );
    });
  });

  test('order in sequence is n/a for top level block', async function(assert) {
    assert.expect(1);
    let program = EmberObject.create({
      belongsTo() {
        return  EmberObject.create({ id() { return 1; }});
      }
    });

    let report = EmberObject.create({
      academicLevels: [],
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: resolve(false)
    });

    let block = EmberObject.create({
      id: 2,
      description: 'lorem ipsum',
      report: resolve(report),
      parent: resolve(null),
      sessions: resolve([]),
      duration: 0,
      startDate: null,
      endDate: null,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course: resolve(null),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: resolve(EmberObject.create({ name: 'Year 1'}))
    });

    storeMock.reopen({
      query(){
        return resolve([]);
      }
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
        report=report
        sequenceBlock=sequenceBlock
        sortBy=sortBy
        setSortBy=setSortBy}}
    `);
    return settled().then(() => {
      assert.equal(find('.order-in-sequence > span').textContent.trim(), 'n/a');
    });
  });

  test('order in sequence is n/a for nested sequence block in non-ordered sequence ', async function(assert) {
    assert.expect(1);
    let program = EmberObject.create({
      belongsTo() {
        return  EmberObject.create({ id() { return 1; }});
      }
    });

    let report = EmberObject.create({
      academicLevels: [],
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: resolve(false)
    });

    let parentBlock = EmberObject.create({
      id: 1,
      isOrdered: false,
      children: null,
    });

    let block = EmberObject.create({
      id: 2,
      description: 'lorem ipsum',
      report: resolve(report),
      parent: resolve(parentBlock),
      sessions: resolve([]),
      duration: 0,
      startDate: null,
      endDate: null,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course: resolve(null),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: resolve(EmberObject.create({ name: 'Year 1'}))
    });

    parentBlock.set('children', resolve([block]));

    storeMock.reopen({
      query(){
        return resolve([]);
      }
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(() => {
      assert.equal(find('.order-in-sequence > span').textContent.trim(), 'n/a');
    });
  });


  test('change course', async function(assert) {
    assert.expect(11);
    let program = EmberObject.create({
      belongsTo() {
        return  EmberObject.create({ id() { return 1; }});
      }
    });

    let linkedCourse = EmberObject.create({
      id: 1,
      title: 'Course A',
      sessions: resolve([]),
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType: EmberObject.create({ title: 'Block' }),
      level: 4
    });

    let linkableCourse1 = EmberObject.create({
      id: 2,
      title: 'Course C',
      startDate: new Date('2013-02-02'),
      endDate: new Date('2013-03-30'),
      clerkshipType: EmberObject.create({ title: 'Something else' }),
      level: 4
    });

    let linkableCourse2 = EmberObject.create({
      id: 3,
      title: 'Course B',
      startDate: new Date('2012-02-02'),
      endDate: new Date('2012-03-30'),
      clerkshipType: EmberObject.create({ title: 'Indeed.' }),
      level: 4
    });

    let linkableCourses = [
      linkableCourse1,
      linkedCourse,
      linkableCourse2,
    ];

    let report = EmberObject.create({
      academicLevels: [],
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([linkedCourse]),
      isFinalized: resolve(false)
    });

    let block = EmberObject.create({
      id: 2,
      description: 'lorem ipsum',
      report: resolve(report),
      parent: resolve(null),
      sessions: resolve([]),
      duration: 0,
      startDate: null,
      endDate: null,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course: resolve(linkedCourse),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: resolve(EmberObject.create({ name: 'Year 1'})),
      save() {
        assert.ok(true, "The sequence block's  save() function was invoked.");
      }
    });

    storeMock.reopen({
      query(what){
        if ('course' === what) {
          return resolve(linkableCourses);
        } else if ('session' === what) {
          return resolve([]);
        }
      },
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(async () => {
      await click('.course .editinplace .clickable');
      return settled().then(() => {
        assert.equal(findAll('.course option').length, 3, 'Linkable courses dropdown contains three options.');
        assert.equal(find('.course option').textContent.trim(), 'Course A', 'Options are sorted by course title');
        assert.equal(find(findAll('.course option')[1]).textContent.trim(), 'Course B', 'Options are sorted by course title');
        assert.equal(find(findAll('.course option')[2]).textContent.trim(), 'Course C', 'Options are sorted by course title');
        assert.equal(
          find('.course option:checked').textContent.trim(),
          linkedCourse.get('title'),
          'The linked course is selected.'
        );
        this.$('.course option:eq(2)').prop('selected', true).change();
        return settled().then(async () => {
          let details = find('[data-test-course-details]').textContent.trim();
          assert.ok(details.indexOf('Level: ' + linkableCourse1.get('level')) === 0,
            'Linked course details: level has been updated.'
          );
          assert.ok(
            details.indexOf('Start Date: ' + moment(linkableCourse1.get('startDate')).format('YYYY-MM-DD')) > 0,
            'Linked course details: start date has been updated.'
          );
          assert.ok(
            details.indexOf('End Date: ' + moment(linkableCourse1.get('endDate')).format('YYYY-MM-DD')) > 0,
            'Linked course details: end date has been updated.'
          );
          assert.ok(
            details.indexOf('Clerkship (' + linkableCourse1.get('clerkshipType').get('title') + ')') > 0,
            'Linked course details: clerkship title has been updated.'
          );
          await click('.course .actions .done');
          return settled().then(() => {
            assert.equal(find('.course .editinplace').textContent.trim(), linkableCourse1.get('title'),
              'Course title has been updated.');
          });
        });
      });
    });
  });

  test('change description', async function(assert) {
    assert.expect(4);
    let program = EmberObject.create({
      belongsTo() {
        return  EmberObject.create({ id() { return 1; }});
      }
    });

    let report = EmberObject.create({
      academicLevels: [],
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: resolve(false)
    });

    let block = EmberObject.create({
      id: 2,
      description: '',
      report: resolve(report),
      parent: resolve(null),
      sessions: resolve([]),
      duration: 0,
      startDate: null,
      endDate: null,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course: resolve(null),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: resolve(EmberObject.create({ name: 'Year 1'})),
      save() {
        assert.ok(true, "The sequence block's  save() function was invoked.");
      }
    });

    storeMock.reopen({
      query(){
        return resolve([]);
      }
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(async () => {

      assert.equal(find('.description .editinplace').textContent.trim(), 'Click to add a description.');
      await click('.description .editinplace .clickable');
      return settled().then(async () => {
        const newDescription = 'Lorem Ipsum';
        await fillIn('.description textarea', newDescription);
        await click('.description .actions .done');
        return settled().then(() => {
          assert.equal(find('.description .editinplace').textContent.trim(), newDescription);
          assert.equal(block.get('description'), newDescription);
        });
      });
    });
  });

  test('change required', async function(assert) {
    assert.expect(4);
    let program = EmberObject.create({
      belongsTo() {
        return  EmberObject.create({ id() { return 1; }});
      }
    });

    let report = EmberObject.create({
      academicLevels: [],
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: resolve(false)
    });

    let block = EmberObject.create({
      id: 2,
      description: '',
      report: resolve(report),
      parent: resolve(null),
      sessions: resolve([]),
      duration: 0,
      startDate: null,
      endDate: null,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course: resolve(null),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: resolve(EmberObject.create({ name: 'Year 1'})),
      save() {
        assert.ok(true, "The sequence block's  save() function was invoked.");
      }
    });

    storeMock.reopen({
      query(){
        return resolve([]);
      }
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(async () => {

      assert.equal(find('.required .editinplace').textContent.trim(), 'Optional (elective)');
      await click('.required .editinplace .clickable');
      return settled().then(async () => {
        const newVal = 1;
        await fillIn('.required select', newVal);
        await click('.required .actions .done');
        return settled().then(() => {
          assert.equal(find('.required .editinplace').textContent.trim(), 'Required');
          assert.equal(block.get('required'), newVal);
        });
      });
    });
  });

  test('change track', async function(assert) {
    assert.expect(3);
    let program = EmberObject.create({
      belongsTo() {
        return  EmberObject.create({ id() { return 1; }});
      }
    });

    let report = EmberObject.create({
      academicLevels: [],
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: resolve(false)
    });

    let block = EmberObject.create({
      id: 2,
      description: '',
      report: resolve(report),
      parent: resolve(null),
      sessions: resolve([]),
      duration: 0,
      startDate: null,
      endDate: null,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course: resolve(null),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: resolve(EmberObject.create({ name: 'Year 1'})),
      save() {
        assert.ok(true, "The sequence block's  save() function was invoked.");
      }
    });

    storeMock.reopen({
      query(){
        return resolve([]);
      }
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(async () => {
      assert.ok(find('.track input').checked, 'Track toggle is initially set to "yes"');
      await click('.track .switch-label');
      return settled().then(() => {
        assert.notOk(find('.track input').checked, 'Track toggle is now set to "no"');
      });
    });
  });

  test('change child sequence order', async function(assert) {
    assert.expect(3);
    let program = EmberObject.create({
      belongsTo() {
        return  EmberObject.create({ id() { return 1; }});
      }
    });

    let report = EmberObject.create({
      academicLevels: [],
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: resolve(false)
    });

    let block = EmberObject.create({
      id: 2,
      description: '',
      report: resolve(report),
      parent: resolve(null),
      sessions: resolve([]),
      duration: 0,
      startDate: null,
      endDate: null,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course: resolve(null),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: resolve(EmberObject.create({ name: 'Year 1'})),
      children: resolve([]),
      save() {
        return resolve(this);
      }
    });

    storeMock.reopen({
      query(){
        return resolve([]);
      }
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(async () => {
      assert.equal(find('.child-sequence-order .editinplace').textContent.trim(), 'Ordered');
      await click('.child-sequence-order .editinplace .clickable');
      return settled().then(async () => {
        const newVal = 2;
        await fillIn('.child-sequence-order select', newVal);
        await click('.child-sequence-order .actions .done');
        return settled().then(() => {
          assert.equal(find('.child-sequence-order .editinplace').textContent.trim(), 'Unordered');
          assert.equal(block.get('childSequenceOrder'), newVal);
        });
      });
    });
  });

  test('change order in sequence', async function(assert) {
    assert.expect(7);

    let school = EmberObject.create({ id() { return 1; }});

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      }
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: resolve(false)
    });

    let parentBlock = EmberObject.create({
      id: 1,
      isOrdered: true,
      children: null,
    });

    let block = EmberObject.create({
      id: 2,
      description: 'lorem ipsum',
      report: resolve(report),
      parent: resolve(parentBlock),
      sessions: resolve([]),
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course: resolve(null),
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel: resolve(academicLevels[0]),
      save(){
        return resolve(this);
      }
    });

    let siblingBlock = EmberObject.create({
      id: 3,
      orderInSequence: 2
    });

    parentBlock.set('children', resolve([ block, siblingBlock ]));

    storeMock.reopen({
      query(what){
        if ('course' === what) {
          return resolve([]);
        } else if ('session' === what) {
          return resolve([]);
        }
      },
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', null);

    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(async () => {
      assert.equal(find('.order-in-sequence .editinplace').textContent.trim(), block.get('orderInSequence'));
      await click('.order-in-sequence .editinplace .clickable');
      return settled().then(async () => {
        assert.equal(findAll('.order-in-sequence option').length, 2, 'There should be two options');
        assert.equal(find('.order-in-sequence option').value, '1', 'First option has the correct value.');
        assert.equal(find(findAll('.order-in-sequence option')[1]).value, '2', 'Second option has the correct value.');
        assert.equal(find('.order-in-sequence option:checked').value, block.get('orderInSequence'),
          'Correct option is selected.');
        const newVal = 2;
        await fillIn('.order-in-sequence select', newVal);
        await click('.order-in-sequence .actions .done');
        return settled().then(() => {
          assert.equal(find('.order-in-sequence .editinplace').textContent.trim(), newVal);
          assert.equal(block.get('orderInSequence'), newVal);
        });
      });
    });
  });

  test('change academic level', async function(assert) {
    assert.expect(4);
    let program = EmberObject.create({
      belongsTo() {
        return  EmberObject.create({ id() { return 1; }});
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: resolve(false)
    });

    let block = EmberObject.create({
      id: 2,
      description: '',
      report: resolve(report),
      parent: resolve(null),
      sessions: resolve([]),
      duration: 0,
      startDate: null,
      endDate: null,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course: resolve(null),
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: resolve(academicLevels[0]),
      save() {
        assert.ok(true, "The sequence block's  save() function was invoked.");
      }
    });

    storeMock.reopen({
      query(){
        return resolve([]);
      }
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(async () => {

      assert.equal(find('.academic-level .editinplace').textContent.trim(), academicLevels[0].get('name'));
      await click('.academic-level .editinplace .clickable');
      return settled().then(async () => {
        const newVal = 9;
        await fillIn('.academic-level select', newVal);
        await click('.academic-level .actions .done');
        return settled().then(() => {
          assert.equal(find('.academic-level .editinplace').textContent.trim(), `Year ${newVal + 1}`);
          assert.equal(block.get('academicLevel'), academicLevels[9]);
        });
      });
    });
  });

  test('manage sessions', async function(assert) {
    assert.expect(7);

    let school = EmberObject.create({ id() { return 1; }});

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      }
    });

    let linkedCourse = EmberObject.create({
      id: 1,
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType: EmberObject.create({ title: 'Block' }),
      level: 4
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([linkedCourse]),
      isFinalized: resolve(false)
    });

    let session1 = EmberObject.create({
      id: 1,
      course: resolve(linkedCourse),
      title: 'Session B',
      ilms: resolve([]),
      offerings: resolve([]),
      belongsTo(what) {
        if ('ilmSession' === what) {
          return {
            id() {
              return null;
            }
          };
        }
      },
      sessionType: resolve(EmberObject.create({
        'title': 'Presentation'
      })),
      maxSingleOfferingDuration: resolve(10),
      totalSumOfferingsDuration: resolve(20)
    });

    let session2 = EmberObject.create({
      id: 2,
      course: resolve(linkedCourse),
      title: 'Session C',
      ilms: resolve([]),
      offerings: resolve([]),
      belongsTo(what) {
        if ('ilmSession' === what) {
          return {
            id() {
              return null;
            }
          };
        }
      },
      sessionType: resolve(EmberObject.create({
        'title': 'Lecture'
      }))
    });

    linkedCourse.set('sessions', resolve([session1, session2]));

    let block = EmberObject.create({
      id: 2,
      description: 'lorem ipsum',
      report: resolve(report),
      parent: resolve(null),
      sessions: resolve([]),
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course: resolve(linkedCourse),
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel: resolve(academicLevels[0])
    });

    let linkableCourses = [ linkedCourse ];

    storeMock.reopen({
      query(what, params){
        if ('course' === what) {
          assert.equal(params.filters.school[0], school.id());
          assert.equal(params.filters.published, true);
          assert.equal(params.filters.year, report.get('year'));
          return resolve(linkableCourses);
        } else if ('session' === what) {
          assert.equal(params.filters.course, linkedCourse.get('id'));
          assert.equal(params.filters.published, true);
          return resolve([session1, session2]);
        }
      },
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', null);

    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(async () => {
      assert.equal(findAll('.curriculum-inventory-sequence-block-session-manager').length, 0,
        'Sessions-manager is initially not visible.'
      );
      assert.equal(findAll('.sessions').length, 1, 'Sessions-list is initially visible.');

      await click('.sessions .actions button');
      return settled().then(() => {
        assert.equal(findAll('.curriculum-inventory-sequence-block-session-manager').length, 1,
          'Sessions-manager is visible.'
        );
        assert.equal(findAll('.sessions').length, 0, 'Sessions-list is not visible.');
        assert.equal(findAll('.sessions .actions button').length, 0, 'Manage button is not visible.');
      });
    });
  });

  test('finalized/read-only mode', async function(assert) {
    assert.expect(23);

    let school = EmberObject.create({ id() { return 1; }});

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      }
    });

    let linkedCourse = EmberObject.create({
      id: 1,
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType: EmberObject.create({ title: 'Block' }),
      level: 4
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([linkedCourse]),
      isFinalized: resolve(true)
    });

    let parentBlock = EmberObject.create({
      id: 1,
      isOrdered: true,
      children: null,
    });

    let academicLevel = academicLevels[0];

    let ilmSession = EmberObject.create({
      id: 1,
      course: resolve(linkedCourse),
      title: 'Session A',
      ilms: resolve([]),
      offerings: resolve([]),
      belongsTo(what) {
        if ('ilmSession' === what) {
          return {
            id() {
              return 1;
            }
          };
        }
      },
      sessionType: EmberObject.create({
        'title': 'Independent Learning'
      }),
      maxSingleOfferingDuration: resolve(10),
      totalSumOfferingsDuration: resolve(20)
    });

    let session1 = EmberObject.create({
      id: 1,
      course: resolve(linkedCourse),
      title: 'Session B',
      ilms: resolve([]),
      offerings: resolve([]),
      belongsTo(what) {
        if ('ilmSession' === what) {
          return {
            id() {
              return null;
            }
          };
        }
      },
      sessionType: resolve(EmberObject.create({
        'title': 'Presentation'
      })),
      maxSingleOfferingDuration: resolve(10),
      totalSumOfferingsDuration: resolve(20)
    });

    let session2 = EmberObject.create({
      id: 2,
      course: resolve(linkedCourse),
      title: 'Session C',
      ilms: resolve([]),
      offerings: resolve([]),
      belongsTo(what) {
        if ('ilmSession' === what) {
          return {
            id() {
              return null;
            }
          };
        }
      },
      sessionType: resolve(EmberObject.create({
        'title': 'Lecture'
      }))
    });

    linkedCourse.set('sessions', resolve([session1, session2, ilmSession]));

    let block = EmberObject.create({
      id: 2,
      description: 'lorem ipsum',
      report: resolve(report),
      parent: resolve(parentBlock),
      sessions: resolve([]),
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course: resolve(linkedCourse),
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel: resolve(academicLevel)
    });

    parentBlock.set('children', resolve([ block ]));

    let linkableCourses = [ linkedCourse ];

    storeMock.reopen({
      query(what, params){
        if ('course' === what) {
          assert.equal(params.filters.school[0], school.id());
          assert.equal(params.filters.published, true);
          assert.equal(params.filters.year, report.get('year'));
          return resolve(linkableCourses);
        } else if ('session' === what) {
          assert.equal(params.filters.course, linkedCourse.get('id'));
          assert.equal(params.filters.published, true);
          return resolve([session1, session2, ilmSession]);
        }
      },
    });

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', null);

    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
    return settled().then(() => {
      assert.equal(
        find('.description > span').textContent.trim(), block.get('description'),
        'Block description is visible.'
      );
      assert.equal(find('[data-test-course-title]').textContent.trim(), linkedCourse.get('title'), 'Course title is visible.');
      let details = find('[data-test-course-details]').textContent.trim();
      assert.ok(details.indexOf('Level: ' + linkedCourse.get('level')) === 0, 'Level of linked course is visible.');
      assert.ok(
        details.indexOf('Start Date: ' + moment(linkedCourse.get('startDate')).format('YYYY-MM-DD')) > 0,
        'Start date of linked course is visible.'
      );
      assert.ok(
        details.indexOf('End Date: ' + moment(linkedCourse.get('endDate')).format('YYYY-MM-DD')) > 0,
        'End date of linked course is visible.'
      );
      assert.ok(
        details.indexOf('Clerkship (' + linkedCourse.get('clerkshipType').get('title') + ')') > 0,
        'Clerkship-type of linked course is visible.'
      );
      assert.equal(find('.description > span').textContent.trim(), block.get('description'), 'Description is visible.');
      assert.equal(find('.required > span').textContent.trim(), 'Optional (elective)', 'Required is visible.');
      assert.ok(find('.track > span').textContent.trim(), 'Is Track is visible.');
      assert.equal(
        find('.start-date > span').textContent.trim(), moment(block.get('startDate')).format('L'),
        'Start date is visible.'
      );
      assert.equal(
        find('.end-date > span').textContent.trim(), moment(block.get('endDate')).format('L'),
        'End date is visible.'
      );
      assert.equal(find('.duration > span').textContent.trim(), block.get('duration'), 'Duration is visible.');
      assert.equal(find('.child-sequence-order > span').textContent.trim(), 'Ordered', 'Child sequence order is visible.');
      assert.equal(find('.order-in-sequence > span').textContent.trim(), block.get('orderInSequence'), 'Order in sequence is visible.');
      assert.equal(find('.minimum > span').textContent.trim(), block.get('minimum'), 'Minimum is visible.');
      assert.equal(find('.maximum > span').textContent.trim(), block.get('maximum'), 'Maximum is visible.');
      assert.equal(find('.academic-level > span').textContent.trim(), academicLevel.get('name'), 'Academic level is visible.');
      assert.notOk(findAll('.sessions .actions button').length, 'Manage button for sessions is visible.');
      assert.equal(findAll('.curriculum-inventory-sequence-block-session-list tbody tr').length, 2,
        'All linkable sessions are visible'
      );
      assert.equal(
        find(
          findAll('.curriculum-inventory-sequence-block-session-list tbody tr:eq(0) td')[1]
        ).textContent.trim(), 'Session B',
        'Sessions are sorted by title.'
      );
      assert.equal(
        find(
          findAll('.curriculum-inventory-sequence-block-session-list tbody tr:eq(1) td')[1]
        ).textContent.trim(), 'Session C',
        'Sessions are sorted by title.'
      );
    });
  });
});
