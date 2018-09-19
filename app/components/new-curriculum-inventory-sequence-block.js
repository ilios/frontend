/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

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
    const report = this.report;
    const parent = this.parent;
    this.loadAttr.perform(report, parent);
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
    const i18n = this.i18n;
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
  linkableCourses: computed('report.year', 'report.linkedCourses.[]', async function(){
    const report = this.report;
    const program = await report.get('program');
    const schoolId = program.belongsTo('school').id();
    const linkedCourses = await report.get('linkedCourses');
    const allLinkableCourses = await this.store.query('course', {
      filters: {
        school: [schoolId],
        published: true,
        year: report.get('year'),
      }
    });
    // Filter out all courses that are linked to (sequence blocks in) this report.
    return allLinkableCourses.filter(course => {
      return ! linkedCourses.includes(course);
    });
  }),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if (! ['text', 'textarea'].includes(target.type)) {
      return;
    }

    if (13 === keyCode && 'text' === target.type) {
      this.send('save');
      return;
    }

    if(27 === keyCode) {
      this.send('cancel');
    }
  },

  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplaysFor', ['title', 'duration', 'startDate', 'endDate', 'minimum', 'maximum']);
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let block = this.store.createRecord('curriculumInventorySequenceBlock', {
            title: this.title,
            description: this.description,
            parent: this.parent,
            academicLevel: this.academicLevel,
            required: this.required.get('id'),
            track: this.track,
            orderInSequence: this.orderInSequence,
            childSequenceOrder: this.childSequenceOrder.get('id'),
            startDate: this.startDate,
            endDate: this.endDate,
            minimum: this.minimum,
            maximum: this.maximum,
            course: this.course,
            duration: this.duration || 0,
            report: this.report
          });
          this.save(block).finally(()=> {
            const parent = this.parent;
            if (parent) {
              parent.get('children').then(children => {
                children.pushObject(block);
              });
            }
            if (! this.isDestroyed) {
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
