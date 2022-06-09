import Service from '@ember/service';

export default class LoadingOpacityTrackerService extends Service {
  #opacities = new Map();

  set(key, position) {
    this.#opacities.set(key, position);
  }
  get(key) {
    return this.#opacities.get(key);
  }
  has(key) {
    return this.#opacities.has(key);
  }
  clear(key) {
    delete this.#opacities.clear(key);
  }
}
