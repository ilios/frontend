import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    showCreateNewToken: 'newtoken',
    showInvalidateTokens: 'invalidatetokens'
  },
  showCreateNewToken: false,
  showInvalidateTokens: false,
});
