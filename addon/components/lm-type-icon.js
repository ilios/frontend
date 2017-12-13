import Ember from 'ember';
import layout from '../templates/components/lm-type-icon';

const { computed } = Ember;

export default Ember.Component.extend({
  layout,
  listItem: false,
  type: null,
  mimetype: null,
  tagName: 'span',
  classNames: ['lm-type-icon'],
  icon: computed('type', 'mimetype', function() {
    let type = this.get('type');
    let mimetype = this.get('mimetype') || '';
    if(type === 'link'){
      return 'link';
    } else if(type === 'citation'){
      return 'paragraph';
    } else {
      if(mimetype.search(/pdf/) !== -1){
        return 'file-pdf-o';
      }
      if(mimetype.search(/ppt|keynote|pps|pptx|powerpoint/) !== -1){
        return 'file-powerpoint-o';
      }
      if(mimetype.search(/mp4|mpg|mpeg|mov/) !== -1){
        return 'file-movie-o';
      }
      if(mimetype.search(/wav|mp3|aac|flac/) !== -1){
        return 'file-audio-o';
      }
    }
    return 'file';
  })
});
