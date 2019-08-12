import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';

export default Component.extend({
  intl: service(),
  store: service(),

  classNames: ['curriculum-inventory-sequence-block-overview'],
  tagName: 'section',

  academicLevel: null,
  academicLevels: null,
  canUpdate: false,
  childSequenceOrder: null,
  course: null,
  description: null,
  duration: null,
  endDate: null,
  isEditingDatesAndDuration: false,
  isEditingMinMax: false,
  isManagingSessions: false,
  isSaving: false,
  maximum: 0,
  minimum: 0,
  orderInSequence: null,
  orderInSequenceOptions: null,
  parent: null,
  report: null,
  required: null,
  sequenceBlock: null,
  startDate: null,

  requiredLabel: computed('required', function() {
    const intl = this.intl;
    const required = this.required;
    switch(required) {
    case '1':
      return intl.t('general.required');
    case '2':
      return intl.t('general.optionalElective');
    case '3':
      return intl.t('general.requiredInTrack');
    }
  }),

  isElective: computed('required', function() {
    console.log(this.required === '2');
    return this.required === '2';
  }),

  childSequenceOrderLabel: computed('childSequenceOrder', function() {
    const intl = this.intl;
    const childSequenceOrder = this.childSequenceOrder;
    switch(childSequenceOrder) {
    case '1':
      return intl.t('general.ordered');
    case '2':
      return intl.t('general.unordered');
    case '3':
      return intl.t('general.parallel');
    }
  }),

  /**
   * A list of sessions owned by the course this this sequence block may be linked to.
   *
   * @property sessions
   * @type {Ember.computed}
   * @public
   */
  sessions: computed('sequenceBlock.course', async function() {
    const store = this.store;
    const course = await this.sequenceBlock.get('course');
    if (!course) {
      return [];
    }

    const sessions = await store.query('session', {
      filters: {
        course: course.get('id'),
        published: true
      },
    });
    return sessions.toArray();
  }),

  /**
   * A list of courses that can be linked to this sequence block.
   * Returns a promise that resolves to an array of course objects.
   * @property linkableCourses
   * @type {Ember.computed}
   * @public
   */
  linkableCourses: computed('report.year', 'report.linkedCourses.[]', 'sequenceBlock.course', async function() {
    const report = this.report;
    const sequenceBlock = this.sequenceBlock;
    const program = await report.program;
    const schoolId = program.belongsTo('school').id();
    const allLinkableCourses = await this.store.query('course', {
      filters: {
        published: true,
        school: [schoolId],
        year: report.get('year')
      }
    });
    const linkedCourses = await report.linkedCourses;
    // Filter out all courses that are linked to (sequence blocks in) this report.
    const linkableCourses = allLinkableCourses.filter((course) => {
      return !linkedCourses.includes(course);
    });
    // Always add the currently linked course to this list, if existent.
    const course = await sequenceBlock.course;

    if (isPresent(course)) {
      linkableCourses.pushObject(course);
    }

    return linkableCourses;
  }),

  init() {
    this._super(...arguments);
    this.set('orderInSequenceOptions', []);
  },

  didReceiveAttrs() {
    this._super(...arguments);
    const sequenceBlock = this.sequenceBlock;
    this.loadAttr.perform(sequenceBlock);
  },

  actions: {
    changeRequired() {
      let block = this.sequenceBlock;
      block.set('required', parseInt(this.required, 10));
      if ('2' === this.required) {
        block.set('minimum', 0);
      }
      block.save();
    },

    setRequired(required) {
      const block = this.sequenceBlock;
      this.set('required', required);
      if ('2' === required) {
        this.set('minimum', 0);
      } else {
        this.set('minimum', block.get('minimum'));
      }
    },

    revertRequiredChanges() {
      let block = this.sequenceBlock;
      this.set('required', '' + block.get('required'));
      this.set('minimum', block.get('minimum'));
    },

    changeCourse() {
      let course = this.course;
      this.saveCourseChange.perform(course);
    },

    revertCourseChanges() {
      let block = this.sequenceBlock;
      this.set('course', block.get('course'));
    },

    changeTrack(value) {
      let block = this.sequenceBlock;
      block.set('track', value);
      block.save();
    },

    changeDescription() {
      let block = this.sequenceBlock;
      const description = this.description;
      block.set('description', description);
      return block.save();
    },

    revertDescriptionChanges() {
      let block = this.sequenceBlock;
      this.set('description', block.get('description'));
    },

    changeChildSequenceOrder() {
      let block = this.sequenceBlock;
      block.set('childSequenceOrder', parseInt(this.childSequenceOrder, 10));
      block.save().then(savedBlock => {
        savedBlock.get('children').then(children => {
          children.invoke('reload');
        });
      });
    },

    revertChildSequenceOrderChanges() {
      let block = this.sequenceBlock;
      this.set('childSequenceOrder', '' + block.get('childSequenceOrder'));
    },

    changeAcademicLevel() {
      let block = this.sequenceBlock;
      block.set('academicLevel', this.academicLevel);
      block.save();
    },

    setAcademicLevel(id) {
      let levels = this.academicLevels;
      let level = levels.findBy('id', id);
      this.set('academicLevel', level);
    },

    revertAcademicLevelChanges() {
      let block = this.sequenceBlock;
      this.set('academicLevel', block.get('academicLevel'));
    },

    changeOrderInSequence() {
      let block = this.sequenceBlock;
      block.set('orderInSequence', this.orderInSequence);
      block.save().then(savedBlock => {
        savedBlock.get('parent').then(parent => {
          parent.get('children').then(children => {
            children.invoke('reload');
          });
        });
      });
    },

    revertOrderInSequenceChanges() {
      let block = this.sequenceBlock;
      this.set('orderInSequence', block.get('orderInSequence'));
    },

    changeDatesAndDuration(start, end, duration) {
      let block = this.sequenceBlock;
      block.set('startDate', start);
      block.set('endDate', end);
      block.set('duration', duration);
      block.save().finally(() => {
        this.set('isEditingDatesAndDuration', false);
      });
    },

    editDatesAndDuration() {
      this.set('isEditingDatesAndDuration', true);
    },

    cancelDateAndDurationEditing() {
      this.set('isEditingDatesAndDuration', false);
    },

    changeMinMax(minimum, maximum) {
      let block = this.sequenceBlock;
      block.set('minimum', minimum);
      block.set('maximum', maximum);
      block.save().finally(() => {
        this.set('isEditingMinMax', false);
      });
    },

    editMinMax() {
      this.set('isEditingMinMax', true);
    },

    cancelMinMaxEditing() {
      let block = this.sequenceBlock;
      this.set('isEditingMinMax', false);
      this.set('minimum', block.get('minimum'));
      this.set('maximum', block.get('maximum'));
    },

    toggleManagingSessions() {
      this.set('isManagingSessions', ! this.isManagingSessions);
    },

    cancelManagingSessions() {
      this.set('isManagingSessions', false);
    },

    changeSessions(sessions, excludedSessions) {
      let block = this.sequenceBlock;
      block.set('sessions', sessions);
      block.set('excludedSessions', excludedSessions);
      return block.save().then(() => {
        this.set('isManagingSessions', false);
      });
    }
  },

  loadAttr: task(function* (sequenceBlock) {
    const report = yield sequenceBlock.get('report');
    const parent = yield sequenceBlock.get('parent');
    let academicLevels = yield report.get('academicLevels');
    academicLevels = academicLevels.toArray();
    let isInOrderedSequence = false;
    let orderInSequenceOptions = [];
    if (isPresent(parent) && parent.get('isOrdered')) {
      isInOrderedSequence = true;
      const siblings = yield parent.get('children');
      for (let i = 0, n = (siblings.toArray().length); i < n; i++) {
        let num = i + 1;
        orderInSequenceOptions.push(num);
      }
    }
    const linkedSessions = yield sequenceBlock.get('sessions');
    const academicLevel = yield sequenceBlock.get('academicLevel');
    const required = '' + sequenceBlock.get('required');
    const duration = sequenceBlock.get('duration');
    const startDate = sequenceBlock.get('startDate');
    const endDate = sequenceBlock.get('endDate');
    const childSequenceOrder = '' + sequenceBlock.get('childSequenceOrder');
    const orderInSequence = sequenceBlock.get('orderInSequence');
    const description = sequenceBlock.get('description');
    const course = yield sequenceBlock.get('course');
    const minimum = sequenceBlock.get('minimum');
    const maximum = sequenceBlock.get('maximum');
    this.setProperties({
      parent,
      report,
      academicLevel,
      academicLevels,
      isInOrderedSequence,
      orderInSequenceOptions,
      startDate,
      endDate,
      duration,
      childSequenceOrder,
      orderInSequence,
      description,
      linkedSessions,
      course,
      required,
      minimum,
      maximum,
    });
  }),

  saveCourseChange: task(function* (course) {
    let block = this.sequenceBlock;
    const oldCourse = block.get('course');
    if (oldCourse !== course) {
      block.set('sessions', []);
      block.set('excludedSessions', []);
    }
    block.set('course', course);
    yield block.save();
  }).drop()
});
