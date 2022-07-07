import { create, hasClass } from 'ember-cli-page-object';
const definition = {
  scope: '[data-test-lm-type-icon]',
  isLink: hasClass('fa-link', 'svg'),
  isCitation: hasClass('fa-paragraph', 'svg'),
  isPdf: hasClass('fa-file-pdf', 'svg'),
  isPowerpoint: hasClass('fa-file-powerpoint', 'svg'),
  isAudio: hasClass('fa-file-audio', 'svg'),
  isVideo: hasClass('fa-file-video', 'svg'),
  isFile: hasClass('fa-file', 'svg'),
  isListItem: hasClass('.fa-li', 'svg'),
};

export default definition;
export const component = create(definition);
