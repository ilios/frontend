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
    return this.get('host') + '/upload';
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
    const learningMaterialStatuses = this.get('learningMaterialStatuses');
    if (!learningMaterialStatuses) {
      return;
    }

    const statusId = this.get('statusId');
    if (statusId) {
      return learningMaterialStatuses.findBy('id', statusId);
    }

    return learningMaterialStatuses.findBy('title', 'Final');
  }),

  selectedUserRole: computed('learningMaterialUserRoles.[]', 'userRoleId', function () {
    const learningMaterialUserRoles = this.get('learningMaterialUserRoles');
    if (!learningMaterialUserRoles) {
      return;
    }

    const userRoleId = this.get('userRoleId');
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
    const store = this.get('store');
    const save = this.get('save');
    const currentUser = this.get('currentUser');
    const title = this.get('title');
    const type = this.get('type');
    const status = this.get('selectedStatus');
    const userRole = this.get('selectedUserRole');
    const description = this.get('description');
    const originalAuthor = this.get('originalAuthor');
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
      const copyrightPermission = this.get('copyrightPermission');
      const copyrightRationale = this.get('copyrightRationale');
      const filename = this.get('filename');
      const fileHash = this.get('fileHash');
      learningMaterial.setProperties({copyrightRationale, copyrightPermission, filename, fileHash});
      break;
    }
    case 'link': {
      const link = this.get('link');
      learningMaterial.setProperties({link});
      break;
    }
    case 'citation': {
      const citation = this.get('citation');
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
