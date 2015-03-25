import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  store: Ember.inject.service(),
  placeholderTranslation: 'courses.meshSearchPlaceholder',
  subject: null,
  terms: Ember.computed.oneWay('subject.meshDescriptors'),
  isCourse: false,
  isSession: false,
  searchResults: [],
  filteredSearchResults: function(){
    var terms = this.get('terms');
    var avail = this.get('searchResults').filter(function(term){
      return !terms.contains(term);
    });

    return avail.sortBy('title');
  }.property('searchResults.@each', 'terms.@each'),
  actions: {
    add: function(descriptor){
      var subject = this.get('subject');
      subject.get('meshDescriptors').addObject(descriptor);
      if(this.get('isCourse')){
        descriptor.get('courses').addObject(this.get('subject'));
      }
      if(this.get('isSession')){
        descriptor.get('sessions').addObject(this.get('subject'));
      }
      subject.save();
      descriptor.save();
    },
    remove: function(descriptor){
      var subject = this.get('subject');
      subject.get('meshDescriptors').removeObject(descriptor);
      if(this.get('isCourse')){
        descriptor.get('courses').removeObject(this.get('subject'));
      }
      if(this.get('isSession')){
        descriptor.get('sessions').removeObject(this.get('subject'));
      }
      subject.save();
      descriptor.save();
    }
  }
});
