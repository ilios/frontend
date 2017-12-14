import Route from '@ember/routing/route';

export default Route.extend({
  queryParams: {
    expanded: {
      replace: true
    }
  }
});
