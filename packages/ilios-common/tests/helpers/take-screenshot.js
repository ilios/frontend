import { snapdom } from '@zumer/snapdom';
import { getUniqueName } from './screenshot-name';
import { waitForPromise } from '@ember/test-waiters';
import { settled } from '@ember/test-helpers';

let shouldTakeScreenshotsCache;

export const takeScreenshot = async (assert, description = '') => {
  const element = document.getElementById('ilios');
  const filename = getUniqueName(assert, description);
  assert.true(
    element instanceof Element,
    'Unable to capture element for screenshot. Ensure you are using takeComponentScreenhot if this is an integration test.',
  );
  if (!shouldTakeScreenshots()) {
    return;
  }
  return snap(element, filename);
};

export const takeComponentScreenshot = async (assert, description = '') => {
  const filename = getUniqueName(assert, description);
  const testing = document.getElementById('ember-testing');
  let element;
  let i = 0;
  do {
    element = testing.children[i];
    i++;
  } while (element && !(element instanceof Element));
  assert.true(
    element instanceof Element,
    'Unable to capture element for screenshot. Ensure you are using takeScreenhot if this is an acceptance test.',
  );
  if (!shouldTakeScreenshots()) {
    return;
  }
  return snap(element, filename, {
    backgroundColor: 'hsl(0, 0%, 98%)',
  });
};

async function snap(element, filename, options) {
  const snapOptions = Object.assign(
    {
      placeholders: false,
      embedFonts: true,
      height: 1000,
      exclude: ['.ilios-logo picture', '.ilios-footer .version'],
    },
    options,
  );
  await settled();
  const result = await snapdom(element, snapOptions);

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
