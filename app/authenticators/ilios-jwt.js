import Ember from 'ember';
import JwtTokenAuthenticator from 'simple-auth-token/authenticators/jwt';

export default JwtTokenAuthenticator.extend({
  /**
    Extend the JwtTokenAuthenticator to accept a token in liu of credentials
    This allows authentication of an already existing session.
    @method authenticate
    @param {Object} options The credentials to authenticate the session with
    @return {Ember.RSVP.Promise} A promise that resolves when an auth token is
                                 successfully acquired from the server and rejects
                                 otherwise
  */
  authenticate: function(credentials) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if(this.tokenPropertyName in credentials){
        let token = credentials[this.tokenPropertyName];
        let tokenData = this.getTokenData(token);
        let expiresAt = tokenData[this.tokenExpireName];
        let response  = {};
        response[this.tokenPropertyName] = token;
        response[this.tokenExpireName] = expiresAt;
        this.scheduleAccessTokenRefresh(expiresAt, token);

        resolve(this.getResponseData(response));
      } else {
        var data = this.getAuthenticateData(credentials);

        this.makeRequest(this.serverTokenEndpoint, data).then(response => {
          var self = this;
          Ember.run(function() {
            var token = response[self.tokenPropertyName],
              tokenData = self.getTokenData(token),
              expiresAt = tokenData[self.tokenExpireName],
              tokenExpireData = {};

            self.scheduleAccessTokenRefresh(expiresAt, token);

            tokenExpireData[self.tokenExpireName] = expiresAt;

            response = Ember.merge(response, tokenExpireData);

            resolve(self.getResponseData(response));
          });
        }, function(xhr) {
          Ember.run(function() {
            reject(xhr.responseJSON || xhr.responseText);
          });
        });
      }
    });
  }
});
