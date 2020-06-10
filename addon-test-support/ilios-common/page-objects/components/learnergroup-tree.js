import {
  clickable,
  collection,
  create,
  hasClass,
  property,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learnergroup-tree-root=true]',
  title: text(' > [data-test-title]'),
  add: clickable(' > [data-test-title]'),
  isStyledAsLeaf: hasClass( 'em'),
  isStyledAsBranch: hasClass('strong'),
  isHidden: property('hidden'),
  isDisabled: hasClass('disabled'),
  subgroups: collection('> [data-test-subgroups] > [data-test-learnergroup-tree]' , {
    title: text('[data-test-title]', { at: 0 }),
    add: clickable('[data-test-title]', { at: 0 }),
    isStyledAsLeaf: hasClass( 'em' ),
    isStyledAsBranch: hasClass('strong'),
    isHidden: property('hidden'),
    isDisabled: property('disabled'),
    subgroups: collection('> [data-test-subgroups] > [data-test-learnergroup-tree]' , {
      title: text('[data-test-title]', {at: 0}),
      add: clickable('[data-test-title]', {at: 0}),
      isStyledAsLeaf: hasClass('em'),
      isStyledAsBranch: hasClass('strong'),
      isHidden: property('hidden'),
      isDisabled: property('disabled'),
    }),
  }),
};

export default definition;
export const component = create(definition);
