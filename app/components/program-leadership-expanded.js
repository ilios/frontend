import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  tagName: "",
  canUpdate: null,
  program: null,
  isManaging: false,
  collapse() {},
  expand() {},
  setIsManaging() {},
  isSaving: reads('save.isRunning'),

  directors: computed('directorsToAdd.[]', 'directorsToRemove.[]', 'program', async function() {
    const directors = await this.program.directors;
    return directors
      .toArray()
      .concat(this.directorsToAdd)
      .filter((user) => !this.directorsToRemove.includes(user));
  }),

  init() {
    this._super(...arguments);
    this.setProperties({ directorsToAdd: [], directorsToRemove: [] });
  },

  actions: {
    addDirector(user) {
      this.directorsToRemove.removeObject(user);
      this.directorsToAdd.pushObject(user);
    },

    removeDirector(user) {
      this.directorsToAdd.removeObject(user);
      this.directorsToRemove.pushObject(user);
    },

    cancel() {
      this.setIsManaging(false);
      this.setProperties({ directorsToAdd: [], directorsToRemove: [] });
    }
  },

  save: task(function* () {
    yield timeout(10);
    const program = this.program;
    const directors = yield this.directors;
    program.set('directors', directors);
    this.expand();
    yield program.save();
    this.setIsManaging(false);
  })
});
