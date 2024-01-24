import { attribute, create, hasClass, isPresent, text } from 'ember-cli-page-object';
import status from '../user-material-status';

const definition = {
  scope: '[data-test-learning-material]',
  status,
  sessionTitle: text('[data-test-session-title]'),
  courseTitle: text('[data-test-course-title]'),
  title: text('[data-test-title]'),
  isTimed: isPresent('[data-test-is-blanked]'),
  isLink: hasClass('fa-link', '[data-test-lm-type-icon]'),
  isCitation: hasClass('fa-paragraph', '[data-test-lm-type-icon]'),
  isPdf: hasClass('fa-file-pdf', '[data-test-lm-type-icon]'),
  isPowerpoint: hasClass('fa-file-powerpoint', '[data-test-lm-type-icon]'),
  isVideo: hasClass('fa-file-video', '[data-test-lm-type-icon]'),
  isAudio: hasClass('fa-file-audio', '[data-test-lm-type-icon]'),
  isFile: hasClass('fa-file', '[data-test-lm-type-icon]'),
  pdfLink: {
    scope: '[data-test-pdf-link]',
    url: attribute('href'),
  },
  pdfDownloadLink: {
    scope: '[data-test-pdf-download-link]',
    url: attribute('href'),
  },
  fileLink: {
    scope: '[data-test-file-link]',
    url: attribute('href'),
  },
  link: {
    scope: '[data-test-link]',
    url: attribute('href'),
  },
  instructors: text('[data-test-instructors]'),
  firstOfferingDate: text('[data-test-date]'),
};

export default definition;
export const component = create(definition);
