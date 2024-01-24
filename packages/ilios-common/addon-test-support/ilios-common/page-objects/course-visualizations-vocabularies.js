import { create, visitable } from 'ember-cli-page-object';
import root from './components/course-visualize-vocabularies';

export default create({
  visit: visitable('/data/courses/:courseId/vocabularies'),
  root,
});
