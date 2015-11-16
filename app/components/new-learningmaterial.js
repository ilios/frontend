import Ember from 'ember';
import config from 'ilios/config/environment';
import layout from '../templates/components/new-learningmaterial';
import EmberValidations from 'ember-validations';

const { computed } = Ember;
const { alias } = computed;

export default Ember.Component.extend(EmberValidations, {
  init() {
    const type = this.get('learningMaterial.type');

    switch (type) {
      case 'file':
        this.set('isFile', true);
        break;
      case 'link':
        this.setProperties({ isLink: true, 'validations.urlBuffer': { presence: true, url: true } });
        break;
      case 'citation':
        this.set('isCitation', true);
        break;
    }

    this._super(...arguments);
  },

  willDestroy() {
    let validations = this.get('validations');
    delete validations.urlBuffer;
  },

  layout: layout,
  classNames: ['newlearningmaterial'],
  learningMaterial: null,
  learningMaterialStatuses: [],
  learningMaterialUserRoles: [],
  hasCopyrightPermission: false,

  editorParams: config.froalaEditorDefaults,

  titleBuffer: alias('learningMaterial.title'),
  authorBuffer: alias('learningMaterial.originalAuthor'),
  urlBuffer: alias('learningMaterial.link'),
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

  actions: {
    save() {
      this.validate()
        .then(() => {
          this.sendAction('save', this.get('learningMaterial'));
        })
        .catch(() => {
          return;
        });
    },

    remove: function(){
      this.sendAction('remove', this.get('learningMaterial'));
    },
    setFile: function(e){
      this.get('learningMaterial').set('filename', e.filename);
      this.get('learningMaterial').set('fileHash', e.fileHash);
    },
    changeSelectedStatus(){
      let selectedEl = this.$('select')[0];
      let selectedIndex = selectedEl.selectedIndex;
      let learningMaterialStatuses = this.get('learningMaterialStatuses');
      let status = learningMaterialStatuses.toArray()[selectedIndex];
      this.set('learningMaterial.status', status);
    },
    changeSelectedRole(){
      let selectedEl = this.$('select')[1];
      let selectedIndex = selectedEl.selectedIndex;
      let learningMaterialUserRoles = this.get('learningMaterialUserRoles');
      let role = learningMaterialUserRoles.toArray()[selectedIndex];
      this.set('learningMaterial.userRole', role);
    },
    changeDescription(event, editor){
      if(editor){
        this.get('learningMaterial').set('description', editor.getHTML());
      }
    },

    changeAuthor(author) {
      this.set('learningMaterial.originalAuthor', author);
    },

    changeDisplayName(name) {
      this.set('learningMaterial.title', name);
    },

    changeUrl(url) {
      this.set('learningMaterial.link', url);
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
