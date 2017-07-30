import Ember from 'ember';
import JwtTokenAuthenticator from 'ember-simple-auth-token/authenticators/jwt';


export default JwtTokenAuthenticator.extend({
  commonAjax: Ember.inject.service(),
  /**
    Extend the JwtTokenAuthenticator to accept a token in liu of credentials
    This allows authentication of an already existing session.
    @method authenticate
    @param {Object} credentials The credentials to authenticate the session with
    @param {Object} headers Request headers.
    @return {Ember.RSVP.Promise} A promise that resolves when an auth token is
                                 successfully acquired from the server and rejects
                                 otherwise
  */
  authenticate(credentials, headers) {
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
          const token = Ember.get(response, this.tokenPropertyName);
          const tokenData = this.getTokenData(token);
          const expiresAt = Ember.get(tokenData, this.tokenExpireName);
          const tokenExpireData = {};
          this.scheduleAccessTokenRefresh(expiresAt, token);
          tokenExpireData[this.tokenExpireName] = expiresAt;
          response = Ember.merge(response, tokenExpireData);
          resolve(this.getResponseData(response));
        }, e => {
          let error = {
            'message': e.message,
            'keys': e.payload.errors || [],
          };
          reject(error);
        });
      }
    });
  },

  /**
   * Extend the default make request in order to user our own commonAjax service
   * Using our service allows us to use a custom hostname instead of just '/'
   *
   * @method makeRequest
   * @param {string} url The URL to post to.
   * @param {Object} data The POST data.
   * @param {Object} providedHeaders Request headers.
   * @return {Ember.RSVP.Promise} The result of the request.
  */
  makeRequest(url, data, providedHeaders) {
    const commonAjax = this.get('commonAjax');
    let headers = this.headers;
    if (providedHeaders) {
      Object.keys(headers).forEach((key) => {
        headers[key] = providedHeaders[key];
      });
    }

    return commonAjax.post(url, {
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      headers,
    });
  },
});
