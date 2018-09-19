/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { set, computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const { equal, not, reads } = computed;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 4,
      max: 60
    }),
  ],
  originalAuthor: [
    validator('presence', true),
    validator('length', {
      min: 2,
      max: 80
    }),
  ],
  fileHash: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.isFile'],
      disabled: not('model.isFile')
    }),
  ],
  filename: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.isFile'],
      disabled: not('model.isFile')
    }),
  ],
  link: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.isLink'],
      disabled: not('model.isLink')
    }),
  ],
  citation: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.isCitation'],
      disabled: not('model.isCitation')
    }),
  ],
  copyrightRationale: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.copyrightPermission'],
      disabled: computed('model.isFile', 'model.copyrightPermission', function(){
        return !this.get('model.isFile') || this.get('model.copyrightPermission');
      })
    }),
    validator('length', {
      min: 2,
      max: 65000
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  currentUser: service(),
  iliosConfig: service(),
  host: reads('iliosConfig.apiHost'),
  uploadPath: computed('host', function () {
    return this.host + '/upload';
  }),

  isFile: equal('type', 'file'),
  isCitation: equal('type', 'citation'),
  isLink: equal('type', 'link'),

  classNames: ['new-learningmaterial'],

  learningMaterialStatuses: null,
  learningMaterialUserRoles: null,

  filename: null,
  fileHash: null,
  statusId: null,
  userRoleId: null,
  description: null,
  originalAuthor: null,
  title: null,
  link: 'http://',
  copyrightPermission: false,
  copyrightRationale: null,
  owner: null,
  citation: null,
  fileUploadErrorMessage: false,

  selectedStatus: computed('learningMaterialStatuses.[]', 'statusId', function () {
    const learningMaterialStatuses = this.learningMaterialStatuses;
    if (!learningMaterialStatuses) {
      return;
    }

    const statusId = this.statusId;
    if (statusId) {
      return learningMaterialStatuses.findBy('id', statusId);
    }

    return learningMaterialStatuses.findBy('title', 'Final');
  }),

  selectedUserRole: computed('learningMaterialUserRoles.[]', 'userRoleId', function () {
    const learningMaterialUserRoles = this.learningMaterialUserRoles;
    if (!learningMaterialUserRoles) {
      return;
    }

    const userRoleId = this.userRoleId;
    if (userRoleId) {
      return learningMaterialUserRoles.findBy('id', userRoleId);
    }

    return learningMaterialUserRoles.get('firstObject');
  }),

  prepareSave: task(function *() {
    this.send('addErrorDisplaysFor', ['title', 'originalAuthor', 'fileHash', 'url', 'citation']);
    let {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      return;
    }
    const store = this.store;
    const save = this.save;
    const currentUser = this.currentUser;
    const title = this.title;
    const type = this.type;
    const status = this.selectedStatus;
    const userRole = this.selectedUserRole;
    const description = this.description;
    const originalAuthor = this.originalAuthor;
    const owningUser = yield currentUser.get('model');

    let learningMaterial = store.createRecord('learningMaterial', {
      title,
      status,
      userRole,
      description,
      originalAuthor,
      owningUser
    });
    switch(type){
    case 'file': {
      const copyrightPermission = this.copyrightPermission;
      const copyrightRationale = this.copyrightRationale;
      const filename = this.filename;
      const fileHash = this.fileHash;
      learningMaterial.setProperties({copyrightRationale, copyrightPermission, filename, fileHash});
      break;
    }
    case 'link': {
      const link = this.link;
      learningMaterial.setProperties({link});
      break;
    }
    case 'citation': {
      const citation = this.citation;
      learningMaterial.setProperties({citation});
      break;
    }
    }

    yield save(learningMaterial);
    this.send('clearErrorDisplay');
  }),

  actions: {
    setFile(e) {
      this.setProperties({
        filename: e.filename,
        fileHash: e.fileHash,
        showUploadStatus: false,
        fileUploadPercentage: 100,
        fileUploadErrorMessage: null,
      });
    },

    startUploadingFile() {
      set(this, 'fileHash', null);
      set(this, 'showUploadStatus', true);
      set(this, 'fileUploadPercentage', 0);
      set(this, 'fileUploadErrorMessage', 0);
    },

    setFileUploadPercentage(percent) {
      set(this, 'fileUploadPercentage', Math.floor(percent));
    },
  }
});
