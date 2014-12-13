import Ember from 'ember';

export default Ember.Mixin.create({
  classNames: ['editinplace'],
  isEditing: false,
  property: null,
  model: null,
  buffer: null,
  tagName: 'span',
  content: function(){
    if(this.get('model') == null || this.get('property') == null){
      return null;
    }
    return this.get('model').get(this.get('property'));
  }.property('model', 'property'),
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
      this.get('model').save().then(function(model){
        self.set('model', model);
        self.notifyPropertyChange('model');
        self.set('buffer', null);
        self.set('isEditing', false);
      });
    }
  }
});
