import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  queryParams: {
    showCreateNewToken: 'newtoken',
    showInvalidateTokens: 'invalidatetokens'
  },
  showCreateNewToken: false,
  showInvalidateTokens: false,
});
