/* eslint ember/no-global-jquery: 0 */
import $ from 'jquery';
import { next } from '@ember/runloop';
import { Promise as EmberPromise } from 'rsvp';

export default function scrollTo(elementQuery, time) {
  time = typeof time !== 'undefined' ? time : 500;

  var promise = new EmberPromise(function(resolve) {
    next(()=>{
      $('html, body').animate({
        scrollTop: $(elementQuery).offset().top
      }, time, function(){
        resolve();
      });
    });
  });

  return promise;
}
