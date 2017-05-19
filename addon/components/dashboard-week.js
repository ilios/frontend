import Ember from 'ember';
import layout from '../templates/components/dashboard-week';
import moment from 'moment';

const { Component } = Ember;

export default Component.extend({
  layout,
  classNames: ['dashboard-week'],
  today: moment().day(1),
});
