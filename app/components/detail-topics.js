import Ember from 'ember';
import DS from 'ember-data';

const {computed, RSVP} = Ember;
const {PromiseArray} = DS;

export default Ember.Component.extend({
  classNames: ['detail-topics'],
  subject: null,
  isManaging: false,
  isSaving: false,
  isCourse: false,
  isSession: false,
  isProgramYear: false,
  bufferedTopics: [],
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
    manage(){
      this.get('subject.topics').then(topics => {
        this.set('bufferedTopics', topics.toArray());
        this.set('isManaging', true);
      });
    },
    save(){
      this.set('isSaving', true);
      let subject = this.get('subject');
      subject.get('topics').then(topicList => {
        topicList.clear();
        this.get('bufferedTopics').forEach(topic=>{
          topicList.pushObject(topic);
        });
        subject.save().then(()=>{
          this.set('isManaging', false);
          this.set('bufferedTopics', []);
          this.set('isSaving', false);
        });
      });
      
    },
    cancel(){
      this.set('bufferedTopics', []);
      this.set('isManaging', false);
    },
    addTopicToBuffer(topic){
      this.get('bufferedTopics').pushObject(topic);
    },
    removeTopicFromBuffer(topic){
      this.get('bufferedTopics').removeObject(topic);
    },
  }
});
