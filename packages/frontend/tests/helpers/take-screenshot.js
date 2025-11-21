import { snapdom } from '@zumer/snapdom';
import { getUniqueName } from './percy-snapshot-name';

export const takeScreenshot = async (assert, description = '') => {
  const filename = getUniqueName(assert, description);
  const el = document.querySelector('#ember-testing');
  const result = await snapdom(el);

  const img = await result.toPng();
  document.body.appendChild(img);

  await result.download({ format: 'png', filename });

  //wait 100ms so the download can finish
  return new Promise((resolve) => setTimeout(resolve, 100));
};
