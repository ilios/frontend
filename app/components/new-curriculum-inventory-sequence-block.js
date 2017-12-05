/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import RSVP from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const { gt, reads } = computed;
const { Promise } = RSVP;

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
  init(){
    this._super(...arguments);
    this.set('orderInSequenceOptions', []);
    this.set('academicLevels', []);
    this.set('childSequenceOrderOptions', []);
    this.set('requiredOptions', []);
  },
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
  startDate: null,
  endDate: null,
  course: null,
  minimum: 0,
  maximum: 0,
  orderInSequenceOptions: null,
  isSaving: false,
  isLoaded: false,
  academicLevels: null,
  childSequenceOrderOptions: null,
  requiredOptions: null,

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
    const i18n = this.get('i18n');
    const childSequenceOrderOptions = [
      EmberObject.create({ 'id' : 1, 'title': i18n.t('general.ordered') }),
      EmberObject.create({ 'id' : 2, 'title': i18n.t('general.unordered') }),
      EmberObject.create({ 'id' : 3, 'title': i18n.t('general.parallel') })
    ];
    const requiredOptions = [
      EmberObject.create({ 'id' : 1, 'title': i18n.t('general.required') }),
      EmberObject.create({ 'id' : 2, 'title': i18n.t('general.optionalElective') }),
      EmberObject.create({ 'id' : 3, 'title': i18n.t('general.requiredInTrack') })
    ];
    const required = requiredOptions[0];
    const childSequenceOrder = childSequenceOrderOptions[0];

    this.setProperties({
      academicLevel,
      academicLevels,
      isInOrderedSequence,
      orderInSequence,
      orderInSequenceOptions,
      requiredOptions,
      childSequenceOrderOptions,
      required,
      childSequenceOrder,
    });
    this.set('isLoaded', true);
  }).restartable(),

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
      report.get('program').then(program => {
        let schoolId = program.belongsTo('school').id();
        this.get('store').query('course', {
          filters: {
            school: [schoolId],
            published: true,
            year: report.get('year'),
          }
        }).then(allLinkableCourses => {
          report.get('linkedCourses').then(linkedCourses => {
            // Filter out all courses that are linked to (sequence blocks in) this report.
            let linkableCourses = allLinkableCourses.filter(function(course) {
              return ! linkedCourses.includes(course);
            });
            resolve(linkableCourses);
          });
        });
      });
    });
  }),

  actions: {
    save() {
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
            report: this.get('report')
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
    cancel() {
      this.sendAction('cancel');
    },
    changeRequired(required) {
      this.set('required', required);
    },
    changeTrack(track) {
      this.set('track', track);
    },
    changeStartDate(startDate) {
      this.set('startDate', startDate);
    },
    changeEndDate(endDate) {
      this.set('endDate', endDate);
    },
    clearDates() {
      this.set('startDate', null);
      this.set('endDate', null);
    }
  }
});
