import Component from '@glimmer/component';

export default class LmTypeIconComponent extends Component {
  get icon() {
    const mimetype = this.args.mimetype || '';
    if(this.args.type === 'link'){
      return 'link';
    } else if(this.args.type === 'citation'){
      return 'paragraph';
    } else {
      if(mimetype.search(/pdf/) !== -1){
        return 'file-pdf';
      }
      if(mimetype.search(/ppt|keynote|pps|pptx|powerpoint/) !== -1){
        return 'file-powerpoint';
      }
      if(mimetype.search(/mp4|mpg|mpeg|mov/) !== -1){
        return 'file-video';
      }
      if(mimetype.search(/wav|mp3|aac|flac/) !== -1){
        return 'file-audio';
      }
    }
    return 'file';
  }
  get title() {
    const type = this.args.type ?? 'file';
    return `general.${type}`;
  }
}
