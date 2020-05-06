import {clickable, collection, create, fillable, hasClass, notHasClass, property, text} from 'ember-cli-page-object';
import detailTermsList from './detail-terms-list';

const definition = {
  scope: '[data-test-taxonomy-manager]',
  selectedTerms: collection('[data-test-detail-terms-list]', detailTermsList),
  vocabulary: {
    scope: '.vocabulary-picker',
    set: fillable('select'),
    options: collection('option', {
      isSelected: property('selected')
    })
  },
  filter: {
    scope: '[data-test-filter]',
    set: fillable(),
  },
  availableTerms: collection('.selectable-terms-list li', {
    name: text(),
    notSelected: notHasClass('selected', 'div'),
    isSelected: hasClass('selected', 'div'),
    toggle: clickable('div'),
  }),
};

export default definition;
export const component = create(definition);
