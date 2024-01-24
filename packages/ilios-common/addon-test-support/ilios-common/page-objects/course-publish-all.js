import { create, visitable } from 'ember-cli-page-object';

import publishAll from './components/publish-all-sessions';
import details from './components/course-details';

export default create({
  visit: visitable('/courses/:courseId/publishall'),
  details,
  publishAll,
});
