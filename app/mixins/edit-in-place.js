import Ember from 'ember';

export default Ember.Mixin.create({
  classNames: ['editinplace'],
  isEditing: false,
  buffer: null,
  tagName: 'span',
  content: null,
  model: null,
  property: null,
  willPersist: true,
  /**
   * In order to observe the property changes on the dynamic property
   * of the dymanic element we have to add and destroy our own observers.
   */
  didInsertElement: function() {
    var property = this.get('property');
    var model = this.get('model');
    if(model && property){
      this.set('content', model.get(property));
      Ember.addObserver(model, property, this, this.propertyDidChange);
    }
  },
  willDestroyElement: function() {
    var property = this.get('property');
    var model = this.get('model');
    if(model && property){
      Ember.removeObserver(model, property, this.propertyDidChange);
    }
  },
  propertyDidChange: function(model, property) {
    if(property){
      if(!this.get('isDestroyed')){
        this.set('content', model.get(property));
      }
    }
  },
  isModified: function(){
    return this.get('buffer') != null && this.get('buffer') !== this.get('content');
  }.property('buffer', 'content'),
  actions: {
    edit: function(){
      this.set('buffer', this.get('content'));
      this.set('isEditing', true);
    },
    cancel: function(){
      this.set('buffer', null);
      this.set('isEditing', false);
    },
    save: function(){
      var self = this;
      var buffer = this.get('buffer');
      this.get('model').set(this.get('property'), buffer);
      if(this.get('willPersist')){
        this.get('model').save().then(function(model){
          self.set('model', model);
          self.notifyPropertyChange('model');
          self.set('buffer', null);
          self.set('isEditing', false);
        });
      } else {
        this.set('buffer', null);
        this.set('isEditing', false);
      }
    }
  }
});
