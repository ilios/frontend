import { moduleForComponent, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForComponent('click-choice-buttons' + testgroup, 'Unit | Component | click choice buttons', {
  unit: true
});

test('it works properly', function(assert) {
  assert.expect(13);

  const firstButton = '.first-button';
  const secondButton = '.second-button';
  const activeClass = 'active';
  const component = this.subject();

  assert.ok(component.get('firstChoicePicked'), 'first button is picked by default');
  assert.equal(component.get('buttonContent1'), null);
  assert.equal(component.get('buttonContent2'), null);

  component.setProperties({ buttonContent1: 'Left Button', buttonContent2: 'Right Button'});

  this.render();

  assert.ok(this.$(firstButton).hasClass(activeClass), 'first button has active class');
  assert.ok(!this.$(secondButton).hasClass(activeClass), 'second button does not have active class');

  component.sendAction = (action) => {
    assert.ok(true, 'button click sends primary action');
    assert.equal(action, 'action');
  };

  this.$(secondButton).click();

  assert.ok(!this.$(firstButton).hasClass(activeClass), 'first button does not have active class');
  assert.ok(this.$(secondButton).hasClass(activeClass), 'second button has active class');

  this.$(firstButton).click();

  assert.ok(this.$(firstButton).hasClass(activeClass), 'first button has active class');
  assert.ok(!this.$(secondButton).hasClass(activeClass), 'second button does not have active class');
});
