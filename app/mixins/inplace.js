import Ember from 'ember';

export default Ember.Mixin.create(Ember.I18n.TranslateableProperties, {
    tagName: 'span',
    value: null,
    //we use a working value in case an objecte gets passed in that doesn't yet exist
    // like course.clerkshipType.id when no clerkship type has been set
    workingValue: null,
    resetWorkingValue: function(){
      this.set('workingValue', this.get('value'));
    }.observes('value').on('init'),
    clickPromptTranslation: 'general.clickToEdit',
    isEditing: false,
    saveOnChange: false,
    //allows the calling object to send some context like an id
    //which can be used during the save process
    condition: null,
    actions: {
      edit: function(){
        this.set('isEditing', true);
      },
      cancel: function(){
        this.set('workingValue', this.get('value'));
        this.set('buffer', null);
        this.set('isEditing', false);
      },
      save: function(){
        this.sendAction('save', this.get('workingValue'), this.get('condition'));
        this.set('buffer', null);
        this.set('isEditing', false);
        this.set('workingValue', this.get('value'));
      }
    }
});
