import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';

export default class AnimateLoadingModifier extends Modifier {
  @service loadingOpacityTracker;
  timeoutId;
  trackingName;
  element;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, () => {
      clearTimeout(this.timeoutId);
      if (this.trackingName) {
        this.loadingOpacityTracker.set(this.trackingName, this.element.style.opacity);
      }
    });
  }

  modify(element, [trackingName], { initialOpacity = 0.1, finalOpacity = 1, loadingTime = 1000 }) {
    this.element = element;
    this.trackingName = trackingName;
    if (trackingName && this.loadingOpacityTracker.has(trackingName)) {
      element.style.opacity = this.loadingOpacityTracker.get(trackingName);
    } else {
      element.style.opacity = initialOpacity;
    }

    this.timeoutId = setTimeout(() => {
      element.style.transition = `opacity ${loadingTime / 1000}s linear`;
      element.style.opacity = finalOpacity;
    }, 1);
  }
}
