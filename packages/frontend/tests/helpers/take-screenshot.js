import { snapdom } from '@zumer/snapdom';
import { getUniqueName } from './percy-snapshot-name';
import { waitForPromise } from '@ember/test-waiters';

let shouldTakeScreenshotsCache;

export const takeScreenshot = async (assert, description = '') => {
  if (!shouldTakeScreenshots()) {
    return;
  }
  const filename = getUniqueName(assert, description);
  return snap(filename);
};

export const takeComponentScreenshot = async (assert, description = '') => {
  if (!shouldTakeScreenshots()) {
    return;
  }
  const filename = getUniqueName(assert, description);
  return snap(filename, {
    backgroundColor: 'hsl(0, 0%, 98%)',
  });
};

async function snap(filename, options) {
  const snapOptions = Object.assign(
    {
      placeholders: false,
      embedFonts: true,
      height: 1000,
      exclude: ['.ilios-logo picture'],
    },
    options,
  );
  const el = document.querySelector('#ember-testing');
  const result = await snapdom(el, snapOptions);

  return waitForPromise(result.download({ format: 'png', filename }));
}

function shouldTakeScreenshots() {
  if (shouldTakeScreenshotsCache) {
    return true;
  }
  if (shouldTakeScreenshotsCache === false) {
    return false;
  }

  const url = new URL(window.location.href, document.baseURI);

  shouldTakeScreenshotsCache = url.searchParams.get('takeScreenshots') !== null;

  if (!shouldTakeScreenshotsCache) {
    console.info('Screenshots Disabled');
  }

  return shouldTakeScreenshotsCache;
}
