/*eslint no-console: 0*/
import Ember from 'ember';
import config from '../config/environment';
import moment from 'moment';

/**
 * Log frontend errors back to the API server
 */
export function initialize(instance) {
  const currentEnv = config.environment;

  if (currentEnv !== 'test') {
    const controller = instance.lookup('controller:application');
    const commonAjax = instance.lookup('service:commonAjax');

    // Global error handler in Ember run loop
    Ember.onerror = (error) => {
      if (error) {
        const mappedError = this.mapError(error);

        console.log(error);
        controller.addError(mappedError);
        this.logError(mappedError, commonAjax);

        if (error.stack) {
          console.error(error.stack);
        }
      }
    };

    // Global error handler for promises
    Ember.RSVP.on('error', (error) => {
      if (error) {
        const mappedError = this.mapError(error);
        if (mappedError.mainMessage !== 'TransitionAborted') {
          console.log(error);
          controller.addError(mappedError);
          this.logError(mappedError, commonAjax);

          if (error.stack) {
            console.error(error.stack);
          }
        }
      }
    });
  }

}



export default {
  name: 'error-service',
  initialize: initialize,
  lastErrorSent: null,
  mapError(error) {
    let errorData = {
      mainMessage: null
    };

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

  incrementLastErrorSent(){
    this.lastErrorSent = moment().unix();
  },
  /**
   * Only send an error condition to the server every a second
   * Otherwise we can DDOS ourselfes with a bad browser error loop
   * @return boolean
   */
  shouldWeSendAnotherError(){
    let diff = moment().unix() - this.lastErrorSent;
    return diff > 1;
  },

  logError(error, commonAjax) {
    if(this.shouldWeSendAnotherError()){
      this.incrementLastErrorSent();
      commonAjax.post('/errors', {
        data: {data: JSON.stringify(error)}
      }).catch(function(e){
        console.log('Error sending error message', e);
        //prevent throwing errors on errors
      });
    }
  }
};
