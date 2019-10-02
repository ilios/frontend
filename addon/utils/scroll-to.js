import { next } from '@ember/runloop';
import { Promise as EmberPromise } from 'rsvp';
import scrollIntoView from 'scroll-into-view';

export default function scrollTo(elementQuery) {
  if (elementQuery instanceof HTMLElement) {
    throw new Error("scrollTo takes a string, not an element");
  }
  var promise = new EmberPromise(function(resolve) {
    next(() => {
      const element = document.querySelector(elementQuery);
      scrollIntoView(element);
      resolve();
    });
  });

  return promise;
}
