import Ember from 'ember';
import config from 'ilios/config/environment';
import layout from '../templates/components/new-learningmaterial';
import EmberValidations from 'ember-validations';

const { Component, computed, inject, set } = Ember;
const { alias } = computed;
const { service } = inject;

export default Component.extend(EmberValidations, {
  init() {
    const type = this.get('type');

    switch (type) {
      case 'file':
        this.setProperties({ 'isFile': true, 'validations.fileHash': { presence: true } });
        break;
      case 'link':
        this.setProperties({ isLink: true, 'validations.urlBuffer': { presence: true, url: true } });
        break;
      case 'citation':
        this.set('isCitation', true);
        break;
    }

    this._super(...arguments);
    const component = this;

    this.get('currentUser.model').then((user) => {
      component.set('owner', user);
    });

    this.get('learningMaterialStatuses').then((statuses) => {
      let defaultStatus = statuses.find((status) => status.get('title') === 'Final');

      if (!defaultStatus) {
        defaultStatus = statuses.get('firstObject');
      }

      this.set('status', defaultStatus);
    });

    this.get('learningMaterialUserRoles').then((roles) => {
      const defaultRole = roles.get('firstObject');

      this.set('userRole', defaultRole);
    });
    
    set(this, 'showUploadStatus', false);
    set(this, 'fileUploadPercentage', 0);
  },

  willDestroy() {
    let validations = this.get('validations');
    delete validations.urlBuffer;
    delete validations.fileHash;
  },

  classNames: ['new-learning-material'],

  currentUser: service(),

  layout: layout,
  learningMaterialStatuses: [],
  learningMaterialUserRoles: [],
  hasCopyrightPermission: false,

  editorParams: config.froalaEditorDefaults,

  titleBuffer: alias('title'),
  authorBuffer: alias('originalAuthor'),
  urlBuffer: alias('link'),
  validations: {
    'titleBuffer': {
      presence: true,
      length: { minimum: 4, maximum: 60 }
    },

    'authorBuffer': {
      presence: true,
      length: { minimum: 2, maximum: 80 }
    }
  },

  topErrorMessageTitle: computed('errors.titleBuffer.[]', 'displayNameError', function() {
    if (this.get('displayNameError')) {
      return this.get('errors.titleBuffer')[0];
    }
  }),

  topErrorMessageAuthor: computed('errors.authorBuffer.[]', 'displayAuthorError', function() {
    if (this.get('displayAuthorError')) {
      return this.get('errors.authorBuffer')[0];
    }
  }),

  topErrorMessageUrl: computed('errors.urlBuffer.[]', 'displayUrlError', function() {
    if (this.get('displayUrlError')) {
      return this.get('errors.urlBuffer')[0];
    }
  }),

  displayNameError: false,
  displayAuthorError: false,
  displayUrlError: false,

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

  checkFileFields(params) {
    const copyrightPermission = this.get('copyrightPermission');
    const copyrightRationale = this.get('copyrightRationale');
    const filename = this.get('filename');
    const fileHash = this.get('fileHash');

    params.copyrightPermission = copyrightPermission;

    if (copyrightRationale) {
      params.copyrightRationale = copyrightRationale;
    }

    if (filename) {
      params.filename = filename;
    }

    if (fileHash) {
      params.fileHash = fileHash;
    }
  },

  checkLinkFields(params) {
    const link = this.get('link');

    if (link) {
      params.link = link;
    }
  },

  checkCitationFields(params) {
    const citation = this.get('citation');

    if (citation) {
      params.citation = citation;
    }
  },

  actions: {
    save() {
      this.validate()
        .then(() => {
          const type = this.get('type');
          const status = this.get('status');
          const userRole = this.get('userRole');
          const description = this.get('description');
          const originalAuthor = this.get('originalAuthor');
          const title = this.get('title');
          const owningUser = this.get('owner');
          const params = {};

          if (description) {
            params.description = description;
          }

          params.type = type;
          params.owningUser = owningUser;
          params.status = status;
          params.userRole = userRole;
          params.originalAuthor = originalAuthor;
          params.title = title;

          if (type === 'file') {
            this.checkFileFields(params);
          } else if (type === 'link') {
            this.checkLinkFields(params);
          } else {
            this.checkCitationFields(params);
          }

          this.sendAction('save', params);
        })
        .catch(() => {
          return;
        });
    },

    remove() {
      this.sendAction('remove');
    },

    setFile(e) {
      this.setProperties({
        filename: e.filename,
        fileHash: e.fileHash,
        showUploadStatus: false,
        fileUploadPercentage: 100
      });
    },

    startUploadingFile() {
      set(this, 'fileHash', null);
      set(this, 'showUploadStatus', true);
      set(this, 'fileUploadPercentage', 0);
    },

    setFileUploadPercentage(percent) {
      set(this, 'fileUploadPercentage', Math.floor(percent));
    },

    changeSelectedStatus() {
      const selectedEl = this.$('select')[0];
      const selectedIndex = selectedEl.selectedIndex;
      const learningMaterialStatuses = this.get('learningMaterialStatuses');
      const status = learningMaterialStatuses.toArray()[selectedIndex];

      this.set('status', status);
    },

    changeSelectedRole() {
      const selectedEl = this.$('select')[1];
      const selectedIndex = selectedEl.selectedIndex;
      const learningMaterialUserRoles = this.get('learningMaterialUserRoles');
      const role = learningMaterialUserRoles.toArray()[selectedIndex];

      this.set('userRole', role);
    },

    changeDescription(event, editor) {
      if (editor) {
        this.set('description', editor.getHTML());
      }
    },

    changeAuthor(author) {
      this.set('originalAuthor', author);
    },

    changeDisplayName(name) {
      this.set('title', name);
    },

    changeUrl(url) {
      this.set('link', url);
    },

    changeCitation(value) {
      this.set('citation', value);
    },

    changeCopyrightRationale(value) {
      this.set('copyrightRationale', value);
    },

    displayNameError() {
      this.set('displayNameError', true);
    },

    displayAuthorError() {
      this.set('displayAuthorError', true);
    },

    displayUrlError() {
      this.set('displayUrlError', true);
    }
  }
});
