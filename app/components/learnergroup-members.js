import Ember from 'ember';
import MembersMixin from 'ilios/mixins/members';

const { Component, RSVP } = Ember;
const { all } = RSVP;

export default Component.extend(MembersMixin, {
  classNames: ['learnergroup-members', 'form-container'],

  tagName: 'section',

  actions: {
    changeLearnerGroup(groupIdString, userId) {
      this.set('saving', true);
      let toSaveArray = [];

      const promise = this.sendPutRequests(groupIdString, userId).then((toSave) => {
        toSaveArray.pushObjects(toSave);
      });

      promise.then(() => {
        all(toSaveArray.uniq().invoke('save')).then(() => {
          this.set('saving', false);
        });
      });
    }
  }
});
