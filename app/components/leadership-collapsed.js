import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  administratorsCount: null,
  directorsCount: null,
  tagName: 'section',
  classNames: ['leadership-collapsed'],
});
