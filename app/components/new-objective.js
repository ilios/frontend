import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import config from 'ilios/config/environment';

const { Component } = Ember;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 65000
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  tagName: 'section',
  classNames: ['new-objective', 'new-result', 'form-container'],
  editorParams: config.froalaEditorDefaults,

  title: null,
  isSaving: false,

  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          this.send('removeErrorDisplayFor', 'title');
          return this.get('save')(this.get('title')).finally(() =>{
            this.set('title', null);
          });
        }
      }).finally(() => {
        this.set('isSaving', false);
      });
    },
    changeTitle(event, editor){
      if(editor){
        const contents = editor.html.get();
        this.set('title', contents);
      }
    },
  }
});
