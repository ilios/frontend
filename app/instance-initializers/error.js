import Ember from 'ember';
import config from '../config/environment';

/**
 * Log frontend errors back to the API server
 */
export function initialize(instance) {
  const currentEnv = config.environment;

  if (currentEnv !== 'test') {
    const controller = instance.container.lookup('controller:application');
    const ajax = instance.container.lookup('service:ajax');
    
    // Global error handler in Ember run loop
    Ember.onerror = (error) => {
      if (error) {
        const filteredError = this.filterError(error);

        console.log(error);
        controller.addError(filteredError);
        this.logError(filteredError, ajax);

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
        this.logError(filteredError, ajax);

        if (error.stack) {
          console.error(error.stack);
        }
      }
    });
  }
  
}



export default {
  name: 'error-service',
  initialize: initialize,
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

  logError(error, ajax) {
    ajax.post('/errors', {
      data: {data: JSON.stringify(error)}
    });
  }
};
