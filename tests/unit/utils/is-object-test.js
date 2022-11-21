// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import EmberObject from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import isObject from 'ilios-common/utils/is-object';
import { module, test } from 'qunit';

module('Unit | Utility | is-object', function () {
  let testData = [
    {
      label: 'POJOs',
      value: { foo: 'bar' },
      expected: true,
    },
    {
      label: 'EmberObjects',
      value: EmberObject.create({ foo: 'bar' }),
      expected: true,
    },
    {
      label: 'ObjectProxies',
      value: ObjectProxy.create({
        content: EmberObject.create({ foo: 'bar' }),
      }),
      expected: true,
    },
  ];

  testData.forEach(({ label, value, expected }) => {
    test(`it works with ${label}`, function (assert) {
      let result = isObject(value);
      assert.strictEqual(result, expected, `should be ${expected}`);
    });
  });
});
