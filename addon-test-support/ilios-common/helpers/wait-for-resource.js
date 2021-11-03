import { settled } from '@ember/test-helpers';
import { next } from '@ember/runloop';

export default async function waitForResource(obj, keyname) {
  const start = performance.now();
  do {
    next(() => {});
    await settled();
  } while (!obj[keyname] && performance.now() - start < 1000);
  return obj[keyname];
}
