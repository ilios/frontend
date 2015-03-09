export function initialize(container, application) {
  application.inject('component:ilios-learnergroup', 'store', 'store:main');
  application.inject('component:ilios-instructorgroup', 'store', 'store:main');
  application.inject('component:ilios-groupmembers', 'store', 'store:main');
  application.inject('component:detail-mesh', 'store', 'store:main');
  application.inject('component:course-header', 'store', 'store:main');
  application.inject('component:user-search', 'store', 'store:main');
  application.inject('component:ilios-sessions-list', 'store', 'store:main');
  application.inject('component:session-overview', 'store', 'store:main');
  application.inject('model:learner-group', 'store', 'store:main');
}

export default {
  name: 'component-store',
  after: ['store'],
  initialize: initialize
};
