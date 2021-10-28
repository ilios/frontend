import { settled } from '@ember/test-helpers';
import { next } from '@ember/runloop';

export default async function waitForResource(obj, keyname) {
  do {
    next(() => {});
    await settled();
  } while (!obj[keyname]);
  return obj[keyname];
}
