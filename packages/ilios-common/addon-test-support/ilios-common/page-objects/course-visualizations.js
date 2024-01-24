import { create, visitable } from 'ember-cli-page-object';
import visualizations from './components/course-visualizations';

export default create({
  visit: visitable('/data/courses/:courseId'),
  visualizations,
});
