import Ember from 'ember';

var Router = Ember.Router.extend({
  location: IliosENV.locationType
});

Router.map(function() {
    this.resource('dashboard', function() {
        this.route('day');
        this.route('week');
        this.route('month');
        this.route('year');
    });
});

export default Router;
