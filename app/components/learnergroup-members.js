import Ember from 'ember';
import MembersMixin from 'ilios/mixins/members';

const { Component } = Ember;

export default Component.extend(MembersMixin, {
  classNames: ['learnergroup-members', 'form-container'],

  tagName: 'section',

  actions: {
    changeLearnerGroup(groupIdString, userId) {
      this.sendPutRequests(groupIdString, userId);
    }
  }
});
