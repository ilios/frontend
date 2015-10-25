import { moduleForComponent, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';
import Ember from 'ember';

const { run } = Ember;
const { next } = run;

moduleForComponent('session-offerings' + testgroup, 'Unit | Component | session offerings', {
  unit: true
});

test('properties have default values', function(assert) {
  assert.expect(1);

  const expected = {
    saving:           false,
    session:          null,
    offeringEditorOn: false
  };

  const component = this.subject();

  const actual = {
    saving:           component.get('saving'),
    session:          component.get('session'),
    offeringEditorOn: component.get('offeringEditorOn'),
  };

  assert.deepEqual(actual, expected, 'default values are correct');
});

test('`toggleEditor` action changes `offeringEditorOn` property', function(assert) {
  assert.expect(1);

  const component = this.subject();

  component.send('toggleEditor', false);

  assert.equal(component.get('offeringEditorOn'), true);
});

test('`closeEditor` action changes `offeringEditorOn` property', function(assert) {
  assert.expect(1);

  const component = this.subject({
    offeringEditorOn: true
  });

  component.send('closeEditor');

  assert.equal(component.get('offeringEditorOn'), false);
});

test('`addMultipleOfferings` action changes `saving` property while promise is resolving', function(assert) {
  assert.expect(2);

  const component = this.subject();

  const params = { learnerGroups: [] };

  component.send('addMultipleOfferings', params);

  assert.equal(component.get('saving'), true);

  next(component, () => {
    assert.equal(component.get('saving'), false);
  });
});
