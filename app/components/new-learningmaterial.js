import Ember from 'ember';
import config from 'ilios/config/environment';
import layout from '../templates/components/new-learningmaterial';
import EmberValidations from 'ember-validations';

const { computed } = Ember;
const { alias } = computed;

export default Ember.Component.extend(EmberValidations, {
  layout: layout,
  classNames: ['newlearningmaterial'],
  learningMaterial: null,
  learningMaterialStatuses: [],
  learningMaterialUserRoles: [],
  hasCopyrightPermission: false,
  isFile: function(){
    return this.get('learningMaterial.type') === 'file';
  }.property('learningMaterial.type'),
  isLink: function(){
    return this.get('learningMaterial.type') === 'link';
  }.property('learningMaterial.type'),
  isCitation: function(){
    return this.get('learningMaterial.type') === 'citation';
  }.property('learningMaterial.type'),
  editorParams: config.froalaEditorDefaults,

  titleBuffer: alias('learningMaterial.title'),
  authorBuffer: alias('learningMaterial.originalAuthor'),
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

  displayNameError: false,
  displayAuthorError: false,

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

    displayNameError() {
      this.set('displayNameError', true);
    },

    displayAuthorError() {
      this.set('displayAuthorError', true);
    }
  }
});
