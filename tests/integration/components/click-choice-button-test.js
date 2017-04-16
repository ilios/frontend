import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('click-choice-buttons', 'Integration | Component | click choice buttons', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(4);

  const firstButton = '.first-button';
  const secondButton = '.second-button';
  const activeClass = 'active';

  this.set('nothing', parseInt);
  this.render(hbs`{{click-choice-buttons
    action=(action nothing)
    firstChoicePicked=true
    buttonContent1='Left Button'
    buttonContent2='Right Button'
  }}`);
  assert.equal(this.$(firstButton).text().trim(), 'Left Button', 'first button has correct text');
  assert.equal(this.$(secondButton).text().trim(), 'Right Button', 'second button has correct text');
  assert.ok(this.$(firstButton).hasClass(activeClass), 'first button has active class');
  assert.notOk(this.$(secondButton).hasClass(activeClass), 'second button does not have active class');
});

test('click fires toggle action', function(assert) {
  assert.expect(8);

  const firstButton = '.first-button';
  const secondButton = '.second-button';
  const activeClass = 'active';

  this.set('firstChoicePicked', true);
  let called = 0;
  this.set('toggle', (newValue) => {
    if (called === 0) {
      assert.notOk(newValue, 'has not been toggled yet');
    } else {
      assert.ok(newValue, 'has been toggled');
    }
    this.set('firstChoicePicked', newValue);
    called ++;
  });
  this.render(hbs`{{click-choice-buttons
    toggle=(action toggle)
    firstChoicePicked=firstChoicePicked
    buttonContent1='Left Button'
    buttonContent2='Right Button'
  }}`);

  assert.ok(this.$(firstButton).hasClass(activeClass), 'first button has active class');
  assert.notOk(this.$(secondButton).hasClass(activeClass), 'second button does not have active class');

  this.$(secondButton).click();

  assert.notOk(this.$(firstButton).hasClass(activeClass), 'first button does not have active class');
  assert.ok(this.$(secondButton).hasClass(activeClass), 'second button has active class');

  this.$(firstButton).click();

  assert.ok(this.$(firstButton).hasClass(activeClass), 'first button has active class');
  assert.notOk(this.$(secondButton).hasClass(activeClass), 'second button does not have active class');
});

test('clicking selected futton does not fire toggle action', function(assert) {
  assert.expect(4);

  const firstButton = '.first-button';
  const secondButton = '.second-button';
  const activeClass = 'active';

  this.set('toggle', () => {
    assert.ok(false, 'this should not be fired');
  });
  this.render(hbs`{{click-choice-buttons
    toggle=(action toggle)
    firstChoicePicked=true
    buttonContent1='Left Button'
    buttonContent2='Right Button'
  }}`);

  assert.ok(this.$(firstButton).hasClass(activeClass), 'first button has active class');
  assert.notOk(this.$(secondButton).hasClass(activeClass), 'second button does not have active class');

  this.$(firstButton).click();

  assert.ok(this.$(firstButton).hasClass(activeClass), 'first button has active class');
  assert.notOk(this.$(secondButton).hasClass(activeClass), 'second button does not have active class');
});
