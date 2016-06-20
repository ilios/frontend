import Ember from 'ember';

const { Component, inject } = Ember;
const { service } = inject;

export default Component.extend({
  iliosConfig: service(),
  tagName: 'section',
  classNames: ['manage-users-summary', 'large-component'],
});
