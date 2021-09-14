import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    showCreateNewToken: 'newtoken',
    showInvalidateTokens: 'invalidatetokens',
    permissionsSchool: null,
    permissionsYear: null,
  },
  showCreateNewToken: false,
  showInvalidateTokens: false,
  permissionsSchool: null,
  permissionsYear: null,
});
