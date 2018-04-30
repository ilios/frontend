/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isEmpty, isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';

const { Promise } = RSVP;

export default Component.extend({
  i18n: service(),
  store: service(),
  classNames: ['curriculum-inventory-sequence-block-overview'],
  tagName: 'section',
  sequenceBlock: null,
  canUpdate: false,
  parent: null,
  report: null,
  minimum: 0,
  maximum: 0,
  orderInSequenceOptions: null,
  startDate: null,
  endDate: null,
  duration: null,
  childSequenceOrder: null,
  orderInSequence: null,
  description: null,
  isSaving: false,
  isManagingSessions: false,
  isEditingDatesAndDuration: false,
  isEditingMinMax: false,
  academicLevels: null,
  course: null,
  required: null,
  academicLevel: null,

  init() {
    this._super(...arguments);
    this.set('orderInSequenceOptions', []);
  },
  didReceiveAttrs(){
    this._super(...arguments);
    const sequenceBlock = this.get('sequenceBlock');
    this.get('loadAttr').perform(sequenceBlock);
  },

  loadAttr: task(function * (sequenceBlock) {
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
    });
  }),

  requiredLabel: computed('required', function(){
    const i18n = this.get('i18n');
    const required = this.get('required');
    switch(required) {
    case '1':
      return i18n.t('general.required');
    case '2':
      return i18n.t('general.optionalElective');
    case '3':
      return i18n.t('general.requiredInTrack');
    }
  }),

  childSequenceOrderLabel: computed('childSequenceOrder', function(){
    const i18n = this.get('i18n');
    const childSequenceOrder = this.get('childSequenceOrder');
    switch(childSequenceOrder) {
    case '1':
      return i18n.t('general.ordered');
    case '2':
      return i18n.t('general.unordered');
    case '3':
      return i18n.t('general.parallel');
    }
  }),

  /**
   * A list of sessions that this sequence block can be linked to. Excludes ILMs.
   *
   * @property linkableSessions
   * @type {Ember.computed}
   * @public
   */
  linkableSessions: computed('sequenceBlock.course', function(){
    return new Promise(resolve => {
      this.get('sequenceBlock').get('course').then(course => {
        if (! isPresent(course)) {
          resolve([]);
          return;
        }
        this.get('store').query('session', {
          filters: {
            course: course.get('id'),
            published: true
          },
        }).then(sessions => {
          // filter out ILM sessions
          let filteredSessions = sessions.toArray().filter(function(session) {
            return isEmpty(session.belongsTo('ilmSession').id());

          });
          resolve(filteredSessions);
        });
      });
    });
  }),

  /**
   * A list of courses that can be linked to this sequence block.
   * Returns a promise that resolves to an array of course objects.
   * @property linkableCourses
   * @type {Ember.computed}
   * @public
   */
  linkableCourses: computed('report.year', 'report.linkedCourses.[]', 'sequenceBlock.course', function(){
    return new Promise(resolve => {
      const report = this.get('report');
      const sequenceBlock = this.get('sequenceBlock');
      report.get('program').then(program => {
        let schoolId = program.belongsTo('school').id();
        this.get('store').query('course', {
          filters: {
            school: [schoolId],
            published: true,
            year: report.get('year'),
          },
        }).then(allLinkableCourses => {
          report.get('linkedCourses').then(linkedCourses => {
            // Filter out all courses that are linked to (sequence blocks in) this report.
            let linkableCourses = allLinkableCourses.filter(function(course) {
              return ! linkedCourses.includes(course);
            });
            // Always add the currently linked course to this list, if existent.
            sequenceBlock.get('course').then(course => {
              if (isPresent(course)) {
                linkableCourses.pushObject(course);
              }
              resolve(linkableCourses);
            });
          });
        });
      });
    });
  }),

  saveCourseChange: task(function * (courseId) {
    let linkableCourses = yield this.get('linkableCourses');
    let course = linkableCourses.toArray().findBy('id', courseId);
    let block = this.get('sequenceBlock');
    block.set('course', course);
    yield block.save();
  }).drop(),

  actions: {
    changeRequired() {
      let block = this.get('sequenceBlock');
      block.set('required', parseInt(this.get('required'), 10));
      block.save();
    },

    revertRequiredChanges() {
      let block = this.get('sequenceBlock');
      this.set('required', '' + block.get('required'));
    },

    changeCourse() {
      let course = this.get('course');
      this.get('saveCourseChange').perform(course.get('id'));
    },

    revertCourseChanges() {
      let block = this.get('sequenceBlock');
      this.set('course', block.get('course'));
    },

    changeTrack(value) {
      let block = this.get('sequenceBlock');
      block.set('track', value);
      block.save();
    },

    changeDescription() {
      let block = this.get('sequenceBlock');
      const description = this.get('description');
      block.set('description', description);
      return block.save();
    },

    revertDescriptionChanges() {
      let block = this.get('sequenceBlock');
      this.set('description', block.get('description'));
    },

    changeChildSequenceOrder() {
      let block = this.get('sequenceBlock');
      block.set('childSequenceOrder', parseInt(this.get('childSequenceOrder'), 10));
      block.save().then(savedBlock => {
        savedBlock.get('children').then(children => {
          children.invoke('reload');
        });
      });
    },

    revertChildSequenceOrderChanges() {
      let block = this.get('sequenceBlock');
      this.set('childSequenceOrder', '' + block.get('childSequenceOrder'));
    },

    changeAcademicLevel(){
      let block = this.get('sequenceBlock');
      block.set('academicLevel', this.get('academicLevel'));
      block.save();
    },

    setAcademicLevel(id) {
      let levels = this.get('academicLevels');
      let level = levels.findBy('id', id);
      this.set('academicLevel', level);
    },

    revertAcademicLevelChanges(){
      let block = this.get('sequenceBlock');
      this.set('academicLevel', block.get('academicLevel'));
    },

    changeOrderInSequence() {
      let block = this.get('sequenceBlock');
      block.set('orderInSequence', this.get('orderInSequence'));
      block.save().then(savedBlock => {
        savedBlock.get('parent').then(parent => {
          parent.get('children').then(children => {
            children.invoke('reload');
          });
        });
      });
    },

    revertOrderInSequenceChanges(){
      let block = this.get('sequenceBlock');
      this.set('orderInSequence', block.get('orderInSequence'));
    },

    changeDatesAndDuration(start, end, duration) {
      let block = this.get('sequenceBlock');
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
      let block = this.get('sequenceBlock');
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
      this.set('isEditingMinMax', false);
    },
    toggleManagingSessions() {
      this.set('isManagingSessions', ! this.get('isManagingSessions'));
    },
    cancelManagingSessions(){
      this.set('isManagingSessions', false);
    },
    changeSessions(sessions) {
      let block = this.get('sequenceBlock');
      block.set('sessions', sessions);
      return block.save().then(() => {
        this.set('isManagingSessions', false);
      });
    },
  }
});
