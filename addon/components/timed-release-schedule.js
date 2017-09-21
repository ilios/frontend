import Ember from 'ember';
import layout from '../templates/components/timed-release-schedule';

const { Component } = Ember;

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['timed-release-schedule'],
  startDate: null,
  endDate: null,
});
