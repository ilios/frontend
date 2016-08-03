import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import { translationMacro as t } from "ember-i18n";
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
  required: false,
  track: false,
  duration: 0,
  orderInSequence: 0,
  childSequenceOrder: 1,
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
  childSequenceOrderOptions: [
    { 'id' : 1, t: 'curriculumInventory.ordered'},
    { 'id' : 2, t: 'curriculumInventory.unordered'},
    { 'id' : 3, t: 'curriculumInventory.parallel'}
  ],

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
    const selectOnePlaceholder = t('general.selectOnePlaceholder').toString();
    this.setProperties({
      academicLevel,
      academicLevels,
      isInOrderedSequence,
      orderInSequence,
      orderInSequenceOptions,
      linkableCourses,
    });
  }),

  actions: {
    save: function(){
      this.set('isSaving', true);
      this.send('addErrorDisplaysFor', ['title', 'duration', 'startDate', 'endDate']);
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let block = this.get('store').createRecord('curriculumInventorySequenceBlock', {
            title: this.get('title'),
            description: this.get('description'),
            parent: this.get('parent'),
            academicLevel: this.get('academicLevel'),
            required: this.get('required'),
            track: this.get('track'),
            orderInSequence: this.get('orderInSequence'),
            childSequenceOrder: this.get('childSequenceOrder'),
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
