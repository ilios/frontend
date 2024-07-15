export function getUniqueName(assert, description) {
  return assert.test.module.name + ' | ' + assert.test.testName + ' | ' + description;
}
