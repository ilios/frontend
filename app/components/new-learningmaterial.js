import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, inject, set } = Ember;
const { equal, not, reads } = computed;
const { service } = inject;

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
  init() {
    this._super(...arguments);
    const component = this;

    this.get('currentUser.model').then((user) => {
      component.set('owner', user);
    });

    this.get('learningMaterialStatuses').then((statuses) => {
      let defaultStatusObject = statuses.findBy('title', 'Final');

      if (!defaultStatusObject) {
        defaultStatusObject = statuses.get('firstObject');
      }

      this.set('status', defaultStatusObject);
    });

    this.get('learningMaterialUserRoles').then((roles) => {
      const defaultRole = roles.get('firstObject');

      this.set('userRole', defaultRole);
    });

    set(this, 'showUploadStatus', false);
    set(this, 'fileUploadPercentage', 0);
  },
  host: reads('iliosConfig.apiHost'),
  uploadPath: computed('host', function(){
    return this.get('host') + '/upload';
  }),


  isFile: equal('type', 'file'),
  isCitation: equal('type', 'citation'),
  isLink: equal('type', 'link'),

  classNames: ['new-learning-material'],

  learningMaterialStatuses: null,
  learningMaterialUserRoles: null,

  filename: null,
  fileHash: null,
  status: null,
  userRole: null,
  description: null,
  originalAuthor: null,
  title: null,
  link: 'http://',
  copyrightPermission: false,
  copyrightRationale: null,
  owner: null,
  citation: null,
  fileUploadErrorMessage: false,

  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.send('addErrorDisplayFor', 'originalAuthor');
      this.send('addErrorDisplayFor', 'fileHash');
      this.send('addErrorDisplayFor', 'url');
      this.send('addErrorDisplayFor', 'citation');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const title = this.get('title');
          const type = this.get('type');
          const status = this.get('status');
          const userRole = this.get('userRole');
          const description = this.get('description');
          const originalAuthor = this.get('originalAuthor');
          const owningUser = this.get('owner');

          let learningMaterial = this.get('store').createRecord('learningMaterial', {
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

          this.get('save')(learningMaterial).finally(()=>{
            this.send('clearErrorDisplay');
          });
        }
      }).finally(() => {
        this.set('isSaving', false);
      });
    },

    changeStatus(id){
      this.get('learningMaterialStatuses').then(statuses => {
        let status = statuses.findBy('id', id);
        this.set('status', status);
      });
    },

    changeUserRole(id){
      this.get('learningMaterialUserRoles').then(roles => {
        let userRole = roles.findBy('id', id);
        this.set('userRole', userRole);
      });
    },

    changeDescription(html) {
      let noTagsText = html.replace(/(<([^>]+)>)/ig,"");
      let strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");

      //if all we have is empty html then save null
      if(strippedText.length === 0){
        html = null;
      }
      this.set('description', html);
    },

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
