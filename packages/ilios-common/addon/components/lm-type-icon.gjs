import Component from '@glimmer/component';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

export default class LmTypeIconComponent extends Component {
  @service intl;

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
      return this.intl.t('general.link');
    } else if (this.args.type === 'citation') {
      return this.intl.t('general.citation');
    } else {
      return this.fileTypeTitle;
    }
  }

  get fileTypeTitle() {
    switch (this.fileType) {
      case 'file-pdf':
        return this.intl.t('general.file-pdf');
      case 'file-powerpoint':
        return this.intl.t('general.file-powerpoint');
      case 'file-video':
        return this.intl.t('general.file-video');
      case 'file-audio':
        return this.intl.t('general.file-audio');
      default:
        return this.intl.t('general.file');
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

  <template>
    <FaIcon
      class="lm-type-icon"
      @icon={{this.icon}}
      @listItem={{@listItem}}
      @fixedWidth={{@fixedWidth}}
      @title={{this.title}}
      data-test-lm-type-icon
    />
  </template>
}
