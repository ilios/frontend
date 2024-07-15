export function getUniqueName(assert, assertion) {
  return assert.test.module.name + ' | ' + assert.test.testName + ' | ' + assertion;
}
