import { create, hasClass } from 'ember-cli-page-object';
const definition = {
  scope: '[data-test-lm-type-icon]',
  isLink: hasClass('fa-link'),
  isCitation: hasClass('fa-paragraph'),
  isPdf: hasClass('fa-file-pdf'),
  isPowerpoint: hasClass('fa-file-powerpoint'),
  isAudio: hasClass('fa-file-audio'),
  isVideo: hasClass('fa-file-video'),
  isFile: hasClass('fa-file'),
  isListItem: hasClass('.fa-li'),
};

export default definition;
export const component = create(definition);
