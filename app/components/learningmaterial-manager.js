import Ember from 'ember';
import { task } from 'ember-concurrency';
import layout from '../templates/components/learningmaterial-manager';

const { Component, computed, inject } = Ember;
const { equal, not } = computed;

export default Component.extend({
  store: inject.service(),
  layout: layout,
  classNames: ['learningmaterial-manager'],

  statusId: null,
  notes: null,
  learningMaterial: null,
  isCourse: false,
  isSession: not('isCourse'),
  editable: true,
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

  didReceiveAttrs(){
    this._super(...arguments);
    const learningMaterial = this.get('learningMaterial');
    const setup = this.get('setup');
    if (learningMaterial){
      setup.perform();
    }
  },
  isFile: equal('type', 'file'),
  isLink: equal('type', 'link'),
  isCitation: equal('type', 'citation'),

  setup: task(function * (){
    const learningMaterial = this.get('learningMaterial');
    this.setProperties(learningMaterial.getProperties(
      'notes',
      'required',
      'publicNotes',
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
  }),
  save: task(function * () {
    const {
      learningMaterial,
      notes,
      required,
      publicNotes,
      statusId,
      terms,
      closeManager,
    } = this.getProperties('learningMaterial', 'notes', 'required', 'publicNotes', 'statusId', 'terms', 'closeManager');
    learningMaterial.set('publicNotes', publicNotes);
    learningMaterial.set('required', required);
    learningMaterial.set('notes', notes);

    const statues = yield this.get('learningMaterialStatuses');
    let status = statues.findBy('id', statusId);

    const parent = yield learningMaterial.get('learningMaterial');
    parent.set('status', status);

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
