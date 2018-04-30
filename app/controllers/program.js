import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    leadershipDetails: 'leadershipDetails',
    manageLeadership: 'manageLeadership',
  },
  leadershipDetails: false,
  manageLeadership: false,
});
