import Ember from 'ember';
import JwtTokenAuthenticator from 'ember-simple-auth-token/authenticators/jwt';

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
  authenticate: function(credentials, headers) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if(this.tokenPropertyName in credentials){
        const token = Ember.get(credentials, this.tokenPropertyName);
        const tokenData = this.getTokenData(token);
        const expiresAt = Ember.get(tokenData, this.tokenExpireName);
        
        this.scheduleAccessTokenRefresh(expiresAt, token);
        
        let response  = {};
        response[this.tokenPropertyName] = token;
        response[this.tokenExpireName] = expiresAt;

        resolve(this.getResponseData(response));
      } else {
        var data = this.getAuthenticateData(credentials);

        this.makeRequest(this.serverTokenEndpoint, data, headers).then(response => {
          Ember.run(() => {
            const token = Ember.get(response, this.tokenPropertyName);
            const tokenData = this.getTokenData(token);
            const expiresAt = Ember.get(tokenData, this.tokenExpireName);
            const tokenExpireData = {};

            this.scheduleAccessTokenRefresh(expiresAt, token);

            tokenExpireData[this.tokenExpireName] = expiresAt;

            response = Ember.merge(response, tokenExpireData);

            resolve(this.getResponseData(response));
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
