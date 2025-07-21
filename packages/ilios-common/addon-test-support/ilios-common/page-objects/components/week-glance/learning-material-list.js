import { collection, create, isPresent, text } from 'ember-cli-page-object';

import learningMaterial from './learning-material';

const definition = {
  materials: collection(
    '[data-test-learning-materials] [data-test-learning-material]',
    learningMaterial,
  ),
  prework: collection('[data-test-learning-materials] [data-test-prework-event]', {
    name: text('a'),
    isUnPublished: isPresent('.awesome-icon-stack.circle-check_slash'),
    hasLink: isPresent('a'),
    materials: collection('[data-test-prework-learning-material]', learningMaterial),
  }),
};

export default definition;
export const component = create(definition);
