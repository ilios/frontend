import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

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
  store: service(),
  i18n: service(),
  classNames: ['new-result', 'new-curriculum-inventory-sequence-block'],
  tagName: 'section',
  title: null,
  description: null,
  parent: null,
  report: null,
  academicLevel: null,
  required: null,
  track: false,
  duration: 0,
  orderInSequence: 0,
  childSequenceOrder: null,
  isInOrderedSequence: false,
  linkableCourse: [],
  startDate: null,
  endDate: null,
  course: null,
  minimum: 0,
  maximum: 0,
  orderInSequenceOptions: [],
  isSaving: false,
  academicLevels: [],
  childSequenceOrderOptions: [],
  requiredOptions: [],

  didReceiveAttrs(){
    this._super(...arguments);
    const report = this.get('report');
    const parent = this.get('parent');
    this.get('loadAttr').perform(report, parent);
  },

  loadAttr: task(function * (report, parent) {
    let academicLevels = yield report.get('academicLevels');
    academicLevels = academicLevels.toArray();

    let isInOrderedSequence = false;
    let orderInSequence = 0;
    let orderInSequenceOptions = [];
    if (isPresent(parent) && parent.get('isOrdered')) {
      isInOrderedSequence = true;
      const siblings = yield parent.get('children');
      for (let i = 0, n = (siblings.toArray().length + 1); i < n; i++) {
        orderInSequenceOptions.push(i + 1);
      }
      orderInSequence = 1;
    }
    const academicLevel = academicLevels[0];
    const linkableCourses = yield report.get('linkableCourses');
    const i18n = this.get('i18n');
    const childSequenceOrderOptions = [
      Ember.Object.create({ 'id' : 1, 'title': i18n.t('curriculumInventory.ordered') }),
      Ember.Object.create({ 'id' : 2, 'title': i18n.t('curriculumInventory.unordered') }),
      Ember.Object.create({ 'id' : 3, 'title': i18n.t('curriculumInventory.parallel') })
    ];
    const requiredOptions = [
      Ember.Object.create({ 'id' : 1, 'title': i18n.t('curriculumInventory.required') }),
      Ember.Object.create({ 'id' : 2, 'title': i18n.t('curriculumInventory.optional') }),
      Ember.Object.create({ 'id' : 3, 'title': i18n.t('curriculumInventory.requiredInTrack') })
    ];
    const required = requiredOptions[0];
    const childSequenceOrder = childSequenceOrderOptions[0];

    this.setProperties({
      academicLevel,
      academicLevels,
      isInOrderedSequence,
      orderInSequence,
      orderInSequenceOptions,
      linkableCourses,
      requiredOptions,
      childSequenceOrderOptions,
      required,
      childSequenceOrder,
    });
  }),

  actions: {
    save: function(){
      this.set('isSaving', true);
      this.send('addErrorDisplaysFor', ['title', 'duration', 'startDate', 'endDate', 'minimum', 'maximum']);
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let block = this.get('store').createRecord('curriculumInventorySequenceBlock', {
            title: this.get('title'),
            description: this.get('description'),
            parent: this.get('parent'),
            academicLevel: this.get('academicLevel'),
            required: this.get('required').get('id'),
            track: this.get('track'),
            orderInSequence: this.get('orderInSequence'),
            childSequenceOrder: this.get('childSequenceOrder').get('id'),
            startDate: this.get('startDate'),
            endDate: this.get('endDate'),
            minimum: this.get('minimum'),
            maximum: this.get('maximum'),
            course: this.get('course'),
            duration: this.get('duration') || 0,
          });
          this.get('save')(block).finally(()=> {
            const parent = this.get('parent');
            if (parent) {
              parent.get('children').then(children => {
                children.pushObject(block);
              });
            }
            if (! this.get('isDestroyed')) {
              this.set('isSaving', false);
            }
          });
        } else {
          this.set('isSaving', false);
        }
      });
    },
    cancel: function(){
      this.sendAction('cancel');
    },
    changeRequired: function(required) {
      this.set('required', required);
    },
    changeTrack: function(track) {
      this.set('track', track);
    },
    changeStartDate: function(startDate) {
      this.set('startDate', startDate);
    },
    changeEndDate: function(endDate) {
      this.set('endDate', endDate);
    },
    clearDates: function() {
      this.set('startDate', null);
      this.set('endDate', null);
    }
  }
});
