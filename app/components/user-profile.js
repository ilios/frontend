import Ember from 'ember';

const { Component} = Ember;

export default Component.extend({
  currentUser: Ember.inject.service(),
  user: null,
  classNames: ['user-profile'],
});
