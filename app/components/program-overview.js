import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  program: null,
  durationOptions: function(){
    var arr = [];
    for(let i=1;i<=10; i++){
      arr.pushObject(Ember.Object.create({
        id: i,
        title: i
      }));
    }

    return arr;
  }.property(),
  classNames: ['program-overview'],
  actions: {
    changeShortTitle: function(value){
      this.get('program').set('shortTitle', value);
      this.get('program').save();
    },
    changeDuration: function(value){
      //if duration isn't changed it means the default of 1 was selected
      value = value == null?1:value;
      this.get('program').set('duration', value);
      this.get('program').save();
    },
  }
});
