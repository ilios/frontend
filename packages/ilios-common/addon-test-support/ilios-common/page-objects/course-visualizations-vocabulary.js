import { create, visitable } from 'ember-cli-page-object';
import root from './components/course-visualize-vocabulary';

export default create({
  visit: visitable('/data/courses/:courseId/vocabularies/:vocabularyId'),
  root,
});
