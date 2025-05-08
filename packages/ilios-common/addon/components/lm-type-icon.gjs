import Component from '@glimmer/component';

export default class LmTypeIconComponent extends Component {
  get icon() {
    if (this.args.type === 'link') {
      return 'link';
    } else if (this.args.type === 'citation') {
      return 'paragraph';
    } else {
      return this.fileType;
    }
  }
  get title() {
    if (this.args.type === 'link') {
      return 'general.link';
    } else if (this.args.type === 'citation') {
      return 'general.citation';
    } else {
      return `general.${this.fileType}`;
    }
  }

  get fileType() {
    const mimetype = this.args.mimetype || '';
    if (mimetype.search(/pdf/) !== -1) {
      return 'file-pdf';
    }
    if (mimetype.search(/ppt|keynote|pps|pptx|powerpoint/) !== -1) {
      return 'file-powerpoint';
    }
    if (mimetype.search(/mp4|mpg|mpeg|mov/) !== -1) {
      return 'file-video';
    }
    if (mimetype.search(/wav|mp3|aac|flac/) !== -1) {
      return 'file-audio';
    }
    return 'file';
  }
}

<FaIcon
  class="lm-type-icon"
  @icon={{this.icon}}
  @listItem={{@listItem}}
  @fixedWidth={{@fixedWidth}}
  @title={{t this.title}}
  data-test-lm-type-icon
/>