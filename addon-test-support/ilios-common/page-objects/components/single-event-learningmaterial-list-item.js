import { create, isPresent, property, text } from 'ember-cli-page-object';
import typeIcon from './lm-type-icon';

const definition = {
  scope: '[data-test-single-event-learningmaterial-list-item]',
  title: text('[data-test-title]'),
  isRequired: isPresent('[data-test-required-icon]'),
  pdfLink: {
    scope: '[data-test-pdf-link]',
    url: property('href'),
  },
  pdfDownloadLink: {
    scope: '[data-test-pdf-download-link]',
    url: property('href'),
  },
  fileLink: {
    scope: '[data-test-file-link]',
    url: property('href'),
  },
  filesize: {
    scope: '[data-test-filesize]',
  },
  link: {
    scope: '[data-test-link]',
    url: property('href'),
  },
  citation: {
    scope: '[data-test-citation]',
  },
  typeIcon,
  timingInfo: {
    scope: '[data-test-timing-info]',
  },
  publicNotes: {
    scope: '[data-test-public-notes]',
  },
};

export default definition;
export const component = create(definition);
