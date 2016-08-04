import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import { translationMacro as t } from "ember-i18n"
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';

const { inject, Component, isPresent } = Ember;
const { service } = inject;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 200,
      descriptionKey: 'general.title'
    })
  ],
  duration: [
    validator('number', {
      allowString: true,
      allowBlank: true,
      integer: true,
      gte: 0
    }),
  ],
  startDate: [
    validator('presence', {
      presence: true,
      dependentKeys: ['duration'],
      disabled(){
        return this.get('model.duration') > 0;
      }
    }),
  ],
  endDate: [
    validator('date', {
      dependentKeys: ['startDate'],
      after: function () {
        return this.get('model.startDate');
      },
      disabled(){
        return this.get('model.duration') > 0 && !this.get('model.startDate');
      }
    })
  ],
  minimum: [
    validator('number', {
      allowString: true,
      integer: true,
      gte: 0
    }),
  ],
  maximum: [
    validator('number', {
      dependentKeys: ['minimum'],
      allowString: true,
      integer: true,
      gte: function() {
        const min = this.get('model.minimum') || 0;
        return Math.max(0, min);
      }
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  i18n: service(),
  store: service(),
  classNames: ['curriculum-inventory-sequence-block-overview'],
  tagName: 'section',
  sequenceBlock: null,
  parent: null,
  report: null,
  academicLevel: null,
  linkableCourse: [],
  course: null,
  minimum: 0,
  maximum: 0,
  orderInSequenceOptions: [],
  startDate: null,
  endDate: null,
  duration: null,
  childSequenceOrder: null,
  orderInSequence: null,

  isSaving: false,
  isFinalized: false,
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
      for (let i = 0, n = (siblings.toArray().length + 1); i < n; i++) {
        orderInSequenceOptions.push(i + 1);
      }
    }
    const academicLevel = yield sequenceBlock.get('academicLevel');
    const linkableCourses = yield report.get('linkableCourses');
    const course = yield sequenceBlock.get('course');
    const duration = sequenceBlock.get('duration');
    const startDate = sequenceBlock.get('startDate');
    const endDate = sequenceBlock.get('endDate');
    const childSequenceOrder = sequenceBlock.get('childSequenceOrder');
    const orderInSequence = sequenceBlock.get('orderInSequence');
    const i18n = this.get('i18n');
    const childSequenceOrderOptions = [
      Ember.Object.create({ 'id' : 1, 'title': i18n.t('curriculumInventory.ordered') }),
      Ember.Object.create({ 'id' : 2, 'title': i18n.t('curriculumInventory.unordered')}),
      Ember.Object.create({ 'id' : 3, 'title': i18n.t('curriculumInventory.parallel')})
    ];
    const requiredOptions = [
      Ember.Object.create({ 'id' : 1, 'title': i18n.t('curriculumInventory.required') }),
      Ember.Object.create({ 'id' : 2, 'title': i18n.t('curriculumInventory.optional')}),
      Ember.Object.create({ 'id' : 3, 'title': i18n.t('curriculumInventory.requiredInTrack')})
    ];
    const isFinalized = yield report.get('isFinalized');
    this.setProperties({
      parent,
      report,
      academicLevel,
      academicLevels,
      isInOrderedSequence,
      orderInSequenceOptions,
      linkableCourses,
      startDate,
      endDate,
      duration,
      childSequenceOrder,
      orderInSequence,
      requiredOptions,
      childSequenceOrderOptions,
      isFinalized
    });
  }),

  actions: {
    changeAcademicLevel: function(value){
      this.get('sequenceBlock').set('academicLevel', value);
      this.get('sequenceBlock').save();
    },

    changeRequired: function(value){
      this.get('sequenceBlock').set('required', value);
      this.get('sequenceBlock').save();
    },

    changeTrack: function(value){
      this.get('sequenceBlock').set('track', value);
      this.get('sequenceBlock').save();
    },

    changeDescription(value) {
      this.get('sequenceBlock').set('description', value);
      this.get('sequenceBlock').save();
    }
  }
});
