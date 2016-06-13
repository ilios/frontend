import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  tagName: 'section',
  classNames: ['collapsed-taxonomies'],
  subject: null,
});
