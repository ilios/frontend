import { create, visitable } from 'ember-cli-page-object';
import root from './components/course-visualize-objectives';

export default create({
  visit: visitable('/data/courses/:courseId/objectives'),
  root,
});
