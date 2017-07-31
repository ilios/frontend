import Ember from 'ember';
import layout from '../templates/components/lm-type-icon';


const { Component, computed } = Ember;

export default Component.extend({
  layout,
  listItem: false,
  lm: null,
  tagName: 'span',
  icon: computed('lm', function() {
    let lm = this.get('lm');
    if(lm.type === 'link'){
      return 'fa-link';
    } else if(lm.type === 'citation'){
      return 'fa-paragraph';
    } else {
      if(lm.mimetype.search(/pdf/) !== -1){
        return 'fa-file-pdf-o';
      }
      if(lm.mimetype.search(/ppt|keynote|pps|ppx/) !== -1){
        return 'fa-file-powerpoint-o';
      }
      if(lm.mimetype.search(/mp4|mpg|mpeg|mov/) !== -1){
        return 'fa-file-movie-o';
      }
      if(lm.mimetype.search(/wav|mp3|aac|flac/) !== -1){
        return 'fa-file-audio-o';
      }
    }
    return 'fa-file';
  })
});
