import {
  clickable,
  collection,
  create,
  hasClass,
  isHidden
} from 'ember-cli-page-object';

const definition = {
  prevIsHidden: isHidden('.prev-link'),
  nextIsHidden: isHidden('.next-link'),
  prevDisabled: hasClass('inactive', '.prev-link'),
  nextDisabled: hasClass('inactive', '.next-link'),
  clickPrev: clickable('.prev-link'),
  clickNext: clickable('.next-link'),
  clickLastPage: clickable('.page-button:last'),
  pageLinks: collection('.page-button')
};

export default definition;
export const component = create(definition);
