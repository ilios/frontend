export function getUniqueName(assert, description) {
  return `${assert.test.module.name}_${assert.test.testName}_${description}_${getColorMode()}`;
}

function getColorMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
