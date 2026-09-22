import { create, hasClass } from 'ember-cli-page-object';

import pcrs from './competencies-list-item-pcrs';
import mapper from './competencies-pcrs-mapper';

const definition = {
  scope: '[data-test-school-competencies-list-item]',
  title: {
    scope: '[data-test-title]',
    isDomain: hasClass('domain'),
    isCompetency: hasClass('competency'),
  },
  pcrs,
  mapper,
};

export default definition;
export const component = create(definition);
