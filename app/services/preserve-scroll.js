import Service from '@ember/service';

export default class PreserveScrollService extends Service {
  #positions = {};

  savePosition(key, position) {
    this.#positions[key] = position;
  }
  getPosition(key) {
    return this.#positions[key] ?? 0;
  }
  clearPosition(key) {
    delete this.#positions[key];
  }
}
