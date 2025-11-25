import { snapdom } from '@zumer/snapdom';
import { getUniqueName } from './percy-snapshot-name';

let shouldTakeScreenshotsCache;

export const takeScreenshot = async (assert, description = '') => {
  if (!shouldTakeScreenshots()) {
    return;
  }
  const filename = getUniqueName(assert, description);
  const el = document.querySelector('#ember-testing');
  const result = await snapdom(el, {
    placeholders: false,
    embedFonts: true,
    height: 1000,
  });

  const img = await result.toPng();
  document.body.appendChild(img);

  await result.download({ format: 'png', filename });

  //wait 100ms so the download can finish
  return new Promise((resolve) => setTimeout(resolve, 100));
};

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
