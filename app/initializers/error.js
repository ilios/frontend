import Ember from 'ember';
import config from '../config/environment';

const { isPresent } = Ember;

export default {
  name: 'error-service',
  after: ['flash-messages', 'simple-auth'],

  _initializeApplicationController(container) {
    return container.lookup('controller:application');
  },

  initialize(container) {
    let currentEnv = config.environment;

    if (currentEnv !== 'test') {
      const controller = this._initializeApplicationController(container);

      // Global error handler in Ember run loop
      Ember.onerror = (error) => {
        console.log(error);

        if (error) {
          controller.addError(error);
          this.logError(error);
        }
      };

      // Global error handler for promises
      Ember.RSVP.on('error', (error) => {
        console.log(error);

        if (error) {
          controller.addError(error);
          this.logError(error);
        }
      });
    }
  },

  logError(error) {
    let errorData = {};

    errorData.mainMessage = error.message || '';
    errorData.stack = error.stack || '';

    if (error.errors && isPresent(error.errors)) {
      errorData.statusCode = error.errors[0].status || '';
      errorData.message = error.errors[0].title || '';
    }

    Ember.$.ajax('/errors', {
      type: 'POST',
      data: JSON.stringify(errorData)
    });
  }
};
