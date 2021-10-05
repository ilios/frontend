import { create, visitable } from 'ember-cli-page-object';

import objectives from './components/course/objectives';
import publishAll from './components/publish-all-sessions';

export default create({
  visit: visitable('/courses/:courseId/publishall'),
  course: {
    scope: '[data-test-ilios-course-details]',
    objectives,
  },
  publishAll,
});
