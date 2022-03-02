import Route from '@ember/routing/route';

export default class DashboardRoute extends Route {
  beforeModel() {
    this.replaceWith('dashboard.week');
  }
}
