/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';
import layout from '../templates/components/learningmaterial-manager';
import moment from 'moment';

const { equal, not, reads } = computed;

const Validations = buildValidations({
  endDate: [
    validator('date', {
      allowBlank: true,
      descriptionKey: 'general.endDate',
      dependentKeys: ['model.startDate'],
      after: reads('model.startDate'),
      disabled: not('model.startDate'),
      precision: 'minute',
      errorFormat: 'L LT'
    }),
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  layout: layout,
  classNames: ['learningmaterial-manager'],

  statusId: null,
  notes: null,
  learningMaterial: null,
  isCourse: false,
  isSession: not('isCourse'),
  editable: false,
  type: null,
  title: null,
  owningUserName: null,
  originalAuthor: null,
  userRoleTitle: null,
  description: null,
  copyrightPermission: null,
  copyrightRationale: null,
  citation: null,
  link: null,
  mimetype: null,
  absoluteFileUri: null,
  filename: null,
  uploadDate: null,
  closeManager: null,
  terms: null,
  startDate: null,
  endDate: null,

  didReceiveAttrs(){
    this._super(...arguments);
    const setup = this.get('setup');
    setup.perform();
  },
  isFile: equal('type', 'file'),
  isLink: equal('type', 'link'),
  isCitation: equal('type', 'citation'),

  canEditTitle: computed('learningMaterial.learningMaterial.courseLearningMaterials.[]', 'learningMaterial.learningMaterial.sessionLearningMaterials.[]', async function() {
    const learningMaterial = this.get('learningMaterial');
    const parent = await learningMaterial.get('learningMaterial');
    const cLmIds = parent.hasMany('courseLearningMaterials').ids();
    const sLmIds = parent.hasMany('sessionLearningMaterials').ids();

    return cLmIds.length + sLmIds.length === 1;
  }),

  setup: task(function * (){
    const learningMaterial = this.get('learningMaterial');
    if (!learningMaterial) {
      yield timeout(10000);
      const setup = this.get('setup');
      yield setup.perform();
    }
    this.setProperties(learningMaterial.getProperties(
      'notes',
      'required',
      'publicNotes',
      'startDate',
      'endDate'
    ));
    const meshDescriptors = yield learningMaterial.get('meshDescriptors');
    this.set('terms', meshDescriptors.toArray());
    const parent = yield learningMaterial.get('learningMaterial');
    this.setProperties(parent.getProperties(
      'type',
      'title',
      'originalAuthor',
      'description',
      'copyrightPermission',
      'copyrightRationale',
      'citation',
      'link',
      'mimetype',
      'absoluteFileUri',
      'filename',
      'uploadDate'
    ));

    const status = yield parent.get('status');
    this.set('statusId', status.get('id'));
    const owningUser = yield parent.get('owningUser');
    this.set('owningUserName', owningUser.get('fullName'));
    const userRole = yield parent.get('userRole');
    this.set('userRoleTitle', userRole.get('title'));

    return true;
  }).restartable(),
  save: task(function* () {
    this.send('addErrorDisplaysFor', ['endDate']);
    let {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      return;
    }
    this.send('clearErrorDisplay');
    const {
      learningMaterial,
      title,
      notes,
      required,
      publicNotes,
      startDate,
      endDate,
      statusId,
      terms,
      closeManager,
    } = this.getProperties('learningMaterial', 'title', 'notes', 'required', 'publicNotes', 'startDate', 'endDate', 'statusId', 'terms', 'closeManager');
    learningMaterial.set('publicNotes', publicNotes);
    learningMaterial.set('required', required);
    learningMaterial.set('notes', notes);
    learningMaterial.set('startDate', startDate);
    learningMaterial.set('endDate', endDate);

    const statues = yield this.get('learningMaterialStatuses');
    let status = statues.findBy('id', statusId);

    const parent = yield learningMaterial.get('learningMaterial');
    parent.set('status', status);
    parent.set('title', title);

    learningMaterial.set('meshDescriptors', terms);
    yield learningMaterial.save();
    yield parent.save();
    closeManager();
  }),
  currentStatus: computed('statusId', 'learningMaterialStatuses.[]', async function () {
    const statusId = this.get('statusId');
    const learningMaterialStatuses = await this.get('learningMaterialStatuses');
    return learningMaterialStatuses.findBy('id', statusId);
  }),
  actions: {
    updateDate(which, value) {
      const oldDate = moment(this.get(which));
      let newDate = moment(value);
      const hour = oldDate.get('hour');
      const minute = oldDate.get('minute');
      newDate.set({hour, minute});
      this.set(which, newDate.toDate());
    },
    updateTime(which, value, type) {
      const oldDate = moment(this.get(which));
      const year = oldDate.get('year');
      const month = oldDate.get('month');
      const date = oldDate.get('date');
      let hour = oldDate.get('hour');
      let minute = oldDate.get('minute');
      if (type === 'hour') {
        hour = value;
      }
      if (type === 'minute') {
        minute = value;
      }

      let newDate = moment();
      newDate.set({year, month, date, hour, minute});
      this.set(which, newDate.toDate());
    },
    addDate(which) {
      let now = moment().hour(8).minute(0).second(0).toDate();
      this.set(which, now);
    },
    addTerm(term) {
      const terms = this.get('terms');
      terms.pushObject(term);
    },
    removeTerm(term) {
      const terms = this.get('terms');
      terms.removeObject(term);
    },
  }
});
