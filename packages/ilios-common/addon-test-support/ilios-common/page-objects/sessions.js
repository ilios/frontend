import { create, visitable } from 'ember-cli-page-object';
import courseSessions from './components/course-sessions';

export default create({
  visit: visitable('/courses/:courseId'),
  courseSessions,
});
