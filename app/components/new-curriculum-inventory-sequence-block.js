import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const { inject, Component, isPresent, computed } = Ember;
const { service } = inject;
const { gt, reads } = computed;

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
      integer: true,
      gte: 0,
      lte: 1200
    }),
  ],
  startDate: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.duration'],
      disabled: gt('model.duration', 0)
    }),
  ],
  endDate: [
    validator('date', {
      dependentKeys: ['model.startDate', 'model.duration'],
      after: reads('model.startDate'),
      disabled: computed('model.duration', 'model.startDate', function(){
        return this.get('model.duration') > 0 && !this.get('model.startDate');
      })
    }),
    validator('presence', {
      presence: true,
      dependentKeys: ['model.startDate', 'model.duration'],
      after: reads('model.startDate'),
      disabled: computed('model.duration', 'model.startDate', function(){
        return this.get('model.duration') > 0 && !this.get('model.startDate');
      })
    }),
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
      gte: computed('model.minimum', function() {
        const min = this.get('model.minimum') || 0;
        return Math.max(0, min);
      })
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
  isLoaded: false,
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
    this.set('isLoaded', false);
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
    let academicLevel = academicLevels[0];
    if (isPresent(parent)) {
      academicLevel = yield parent.get('academicLevel');
    }
    const linkableCourses = yield report.get('linkableCourses');
    const i18n = this.get('i18n');
    const childSequenceOrderOptions = [
      Ember.Object.create({ 'id' : 1, 'title': i18n.t('general.ordered') }),
      Ember.Object.create({ 'id' : 2, 'title': i18n.t('general.unordered') }),
      Ember.Object.create({ 'id' : 3, 'title': i18n.t('general.parallel') })
    ];
    const requiredOptions = [
      Ember.Object.create({ 'id' : 1, 'title': i18n.t('general.required') }),
      Ember.Object.create({ 'id' : 2, 'title': i18n.t('general.optionalElective') }),
      Ember.Object.create({ 'id' : 3, 'title': i18n.t('general.requiredInTrack') })
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

    this.set('isLoaded', true);
  }).restartable(),

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
