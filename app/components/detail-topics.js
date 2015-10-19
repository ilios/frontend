import Ember from 'ember';
import DS from 'ember-data';

const {computed, RSVP} = Ember;
const {PromiseArray} = DS;

export default Ember.Component.extend({
  classNames: ['detail-topics'],
  subject: null,
  isManaging: false,
  isCourse: false,
  isSession: false,
  isProgramYear: false,
  //keep track of our initial state so we can roll back
  initialTopics: [],
  availableTopics: computed('isCourse', 'isSession', 'isProgramYear', 'subject', function(){
    let defer = RSVP.defer();
    
    if(this.get('isCourse')){
      this.get('subject').get('school').then(school => {
        school.get('topics').then(topics => {
          defer.resolve(topics);
        });
      });
    }
    
    if(this.get('isSession')){
      this.get('subject').get('course').then(course => {
        course.get('school').then(school => {
          school.get('topics').then(topics => {
            defer.resolve(topics);
          });
        });
      });
    }
    
    if(this.get('isProgramYear')){
      this.get('subject').get('program').then(program => {
        program.get('school').then(school => {
          school.get('topics').then(topics => {
            defer.resolve(topics);
          });
        });
      });
    }
    
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  actions: {
    manage: function(){
      var self = this;
      this.get('subject.topics').then(function(topics){
        self.set('initialTopics', topics.toArray());
        self.set('isManaging', true);
      });
    },
    save: function(){
      this.set('isManaging', false);
      this.get('subject').save();
    },
    cancel: function(){
      var topics = this.get('subject').get('topics');
      topics.clear();
      topics.addObjects(this.get('initialTopics'));
      this.set('isManaging', false);
    }
  }
});
