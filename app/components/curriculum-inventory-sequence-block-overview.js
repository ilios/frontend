import Ember from 'ember';
import DS from 'ember-data';
import { task } from 'ember-concurrency';

const { inject, Component, isPresent, computed, RSVP, isEmpty } = Ember;
const { PromiseArray } = DS;
const { service } = inject;

export default Component.extend({
  i18n: service(),
  store: service(),
  classNames: ['curriculum-inventory-sequence-block-overview'],
  tagName: 'section',
  sequenceBlock: null,
  parent: null,
  report: null,
  linkableCourses: [],
  minimum: 0,
  maximum: 0,
  orderInSequenceOptions: [],
  startDate: null,
  endDate: null,
  duration: null,
  childSequenceOrder: null,
  orderInSequence: null,
  description: null,

  isSaving: false,
  isFinalized: false,
  isManagingSessions: false,
  isEditingDatesAndDuration: false,
  isEditingMinMax: false,
  academicLevels: [],
  childSequenceOrderOptions: [],
  requiredOptions: [],


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
        orderInSequenceOptions.pushObject(Ember.Object.create({ 'id': num, 'title': num }));
      }
    }

    let linkableCourses = yield report.get('linkableCourses');
    linkableCourses = linkableCourses.toArray();
    const course = yield sequenceBlock.get('course');
    if (course) {
      linkableCourses.pushObject(course);
    }

    const linkedSessions = yield sequenceBlock.get('sessions');
    const duration = sequenceBlock.get('duration');
    const startDate = sequenceBlock.get('startDate');
    const endDate = sequenceBlock.get('endDate');
    const childSequenceOrder = sequenceBlock.get('childSequenceOrder');
    const orderInSequence = sequenceBlock.get('orderInSequence');
    const description = sequenceBlock.get('description');
    const i18n = this.get('i18n');
    const childSequenceOrderOptions = [
      Ember.Object.create({ 'id' : 1, 'title': i18n.t('general.ordered') }),
      Ember.Object.create({ 'id' : 2, 'title': i18n.t('general.unordered')}),
      Ember.Object.create({ 'id' : 3, 'title': i18n.t('general.parallel')})
    ];
    const requiredOptions = [
      Ember.Object.create({ 'id' : 1, 'title': i18n.t('general.required') }),
      Ember.Object.create({ 'id' : 2, 'title': i18n.t('general.optionalElective')}),
      Ember.Object.create({ 'id' : 3, 'title': i18n.t('general.requiredInTrack')})
    ];
    const isFinalized = yield report.get('isFinalized');
    this.setProperties({
      parent,
      report,
      academicLevels,
      isInOrderedSequence,
      orderInSequenceOptions,
      linkableCourses,
      startDate,
      endDate,
      duration,
      childSequenceOrder,
      orderInSequence,
      description,
      requiredOptions,
      childSequenceOrderOptions,
      isFinalized,
      linkedSessions
    });
  }),


  linkableSessions: computed('sequenceBlock.course', function(){
    let defer = RSVP.defer();
    this.get('sequenceBlock').get('course').then(course => {
      if (! isPresent(course)) {
        defer.resolve([]);
        return;
      }
      this.get('store').query('session', {
        filters: {
          course: course.get('id'),
          published: true
        },
        limit: 10000,
      }).then(sessions => {
        // filter out ILM sessions
        let filteredSessions = sessions.toArray().filter(function(session) {
          return isEmpty(session.belongsTo('ilmSession').id());

        });
        defer.resolve(filteredSessions);
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  actions: {
    changeRequired: function(value){
      let block = this.get('sequenceBlock');
      block.set('required', value);
      block.save();
    },

    changeTrack: function(value){
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

    changeChildSequenceOrder(value) {
      let block = this.get('sequenceBlock');
      block.set('childSequenceOrder', value);
      block.save().then(block => {
        block.get('children').then(children => {
          children.invoke('reload');
        });
      });
    },
    changeAcademicLevel(value){
      let academicYear = this.get('academicLevels').findBy('id', value);
      let block = this.get('sequenceBlock');
      block.set('academicLevel', academicYear);
      block.save();
    },

    changeCourse(value) {
      let linkableCourses = this.get('linkableCourses');
      let course = linkableCourses.findBy('id', value);
      let block = this.get('sequenceBlock');
      block.set('course', course);
      block.save();
    },

    changeOrderInSequence(value) {
      let block = this.get('sequenceBlock');
      block.set('orderInSequence', value);
      block.save().then(block => {
        block.get('parent').then(parent => {
          parent.get('children').then(children => {
            children.invoke('reload');
          });
        })
      });
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
