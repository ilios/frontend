import { next } from '@ember/runloop';
import { settled } from '@ember/test-helpers';

export default async function waitForResource(obj, keyname) {
  const da = new DelayedAccess(obj, keyname);
  return da.getValue();
}

class DelayedAccess {
  value = undefined;
  start = performance.now();

  constructor(obj, keyname) {
    this.obj = obj;
    this.keyname = keyname;
  }

  get done() {
    if (Array.isArray(this.value) && this.value.length === 0) {
      if (!this.emptyArrayTimer) {
        this.emptyArrayTimer = performance.now();
      }
      return performance.now() - this.emptyArrayTimer > 1000;
    }
    if (performance.now() - this.start > 1000) {
      return true;
    }

    return this.value !== undefined;
  }

  async getValue() {
    do {
      this.value = this.obj[this.keyname];
      next(() => {});
      await settled();
    } while (!this.done);

    return this.value;
  }
}
