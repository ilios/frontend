import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  queryParams: {
    createNewToken: 'newtoken',
  },
  createNewToken: false,
});
