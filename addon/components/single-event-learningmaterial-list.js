import Ember from 'ember';
import layout from '../templates/components/single-event-learningmaterial-list';

const {computed, isEmpty} = Ember;

export default Ember.Component.extend({
  layout: layout,
  classNames: ['single-event-learningmaterial-list'],
  learningMaterials: null,

  proxiedLearningMaterials: computed('learningMaterials.[]', function(){
    let learningMaterials = this.get('learningMaterials');
    if(isEmpty(learningMaterials)){
      return Ember.A([]);
    }
    learningMaterials = learningMaterials.map(lm => {
      let icon;
      if(lm.type === 'link'){
        icon = 'fa-link';
      } else if(lm.type === 'citation'){
        icon = 'fa-paragraph';
      } else {
        icon = 'fa-file';
        if(lm.mimetype.search(/pdf/) !== -1){
          icon = 'fa-file-pdf-o';
        }
        if(lm.mimetype.search(/ppt|keynote|pps|ppx/) !== -1){
          icon = 'fa-file-powerpoint-o';
        }
        if(lm.mimetype.search(/mp4|mpg|mpeg|mov/) !== -1){
          icon = 'fa-file-movie-o';
        }
        if(lm.mimetype.search(/wav|mp3|aac|flac/) !== -1){
          icon = 'fa-file-audio-o';
        }
      }
      lm.icon = icon;

      return lm;
    });
    return Ember.A(learningMaterials);
  })
});
