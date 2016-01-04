import Ember from 'ember';
import config from '../config/environment';

export default {
  name: 'error-service',
  after: ['flash-messages'],

  _initializeApplicationController(container) {
    return container.lookup('controller:application');
  },

  initialize(container) {
    let currentEnv = config.environment;

    if (currentEnv !== 'test') {
      const controller = this._initializeApplicationController(container);

      // Global error handler in Ember run loop
      Ember.onerror = (error) => {
        if (error) {
          const filteredError = this.filterError(error);

          console.log(error);
          controller.addError(filteredError);
          this.logError(filteredError);

          if (error.stack) {
            console.error(error.stack);
          }
        }
      };

      // Global error handler for promises
      Ember.RSVP.on('error', (error) => {
        if (error) {
          const filteredError = this.filterError(error);

          console.log(error);
          controller.addError(filteredError);
          this.logError(filteredError);

          if (error.stack) {
            console.error(error.stack);
          }
        }
      });
    }
  },

  filterError(error) {
    let errorData = {};

    if (error.message) {
      errorData.mainMessage = error.message;
    }
    if (error.stack) {
      errorData.stack = error.stack;
    }
    if (error.errors && error.errors[0]) {
      const errorHash = error.errors[0];

      if (errorHash.status) {
        errorData.statusCode = errorHash.status;
      }
      if (errorHash.title) {
        errorData.message = errorHash.title;
      }
    }

    return errorData;
  },

  logError(error) {
    Ember.$.ajax('/errors', {
      type: 'POST',
      data: {data: JSON.stringify(error)}
    });
  }
};
