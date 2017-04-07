import Ember from 'ember';
import moment from 'moment';

const { Component } = Ember;

export default Component.extend({
  classNames: ['dashboard-week'],
  today: moment().day(1),
});
