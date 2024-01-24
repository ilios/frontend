import { next } from '@ember/runloop';
import { settled } from '@ember/test-helpers';

export default async function waitForResource(obj, keyname) {
  const da = new DelayedAccess(obj, keyname);
  return da.getValue();
}

class DelayedAccess {
  value = undefined;
  start = performance.now();
  emptyValueTimer;

  constructor(obj, keyname) {
    this.obj = obj;
    this.keyname = keyname;
  }

  get done() {
    if (Array.isArray(this.value) && this.value.length === 0) {
      return this.checkPossiblyEmptyValue();
    }
    if (performance.now() - this.start > 1000) {
      return true;
    }

    if (!this.value) {
      return this.checkPossiblyEmptyValue();
    }

    return true;
  }

  checkPossiblyEmptyValue() {
    if (!this.emptyValueTimer) {
      this.emptyValueTimer = performance.now();
    }
    return performance.now() - this.emptyValueTimer > 1000;
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
