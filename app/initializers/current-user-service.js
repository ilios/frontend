import Ember from 'ember';
import config from 'ilios/config/environment';
import CurrentUser from '../services/current-user';

/**
 * Loads the current user from the api and the users model
 * By using the CurrentUserService continer we can do session based stuff in the
 * service instead of in the user model.
 *
 * Had to wrap everything in a double Ember.run otehrwise tests wont run.
 */
export default {
  name: 'current-user-service',
  after: ['store'],
  initialize: function(container, application) {
    application.deferReadiness();
    var url = config.adapterHost + '/' + config.adapterNamespace + '/currentsession';
    Ember.run(function(){
      Ember.$.getJSON(url).then(function(data) {
        Ember.run(function(){
          container.lookup('store:main').find('user', data.currentsession.userId).then(function(user){
            //set the cotent property on the current user which allows
            //it to work as an ObjectProxy for the user model
            var CurrentUserService = CurrentUser.extend({ content: user});

            application.register('user:current', CurrentUserService);
            application.inject('route', 'currentUser', 'user:current');
            application.inject('controller', 'currentUser', 'user:current');
            application.advanceReadiness();
          });
        });
      });
    });
  }
};
