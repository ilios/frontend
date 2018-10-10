import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | click choice buttons', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);

    const firstButton = '.first-button';
    const secondButton = '.second-button';
    const activeClass = 'active';

    this.set('nothing', parseInt);
    await render(hbs`{{click-choice-buttons
      action=(action nothing)
      firstChoicePicked=true
      buttonContent1='Left Button'
      buttonContent2='Right Button'
    }}`);
    assert.equal(find(firstButton).textContent.trim(), 'Left Button', 'first button has correct text');
    assert.equal(find(secondButton).textContent.trim(), 'Right Button', 'second button has correct text');
    assert.ok(find(firstButton).classList.contains(activeClass), 'first button has active class');
    assert.notOk(find(secondButton).classList.contains(activeClass), 'second button does not have active class');
  });

  test('click fires toggle action', async function(assert) {
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
    await render(hbs`{{click-choice-buttons
      toggle=(action toggle)
      firstChoicePicked=firstChoicePicked
      buttonContent1='Left Button'
      buttonContent2='Right Button'
    }}`);

    assert.ok(find(firstButton).classList.contains(activeClass), 'first button has active class');
    assert.notOk(find(secondButton).classList.contains(activeClass), 'second button does not have active class');

    await click(secondButton);

    assert.notOk(find(firstButton).classList.contains(activeClass), 'first button does not have active class');
    assert.ok(find(secondButton).classList.contains(activeClass), 'second button has active class');

    await click(firstButton);

    assert.ok(find(firstButton).classList.contains(activeClass), 'first button has active class');
    assert.notOk(find(secondButton).classList.contains(activeClass), 'second button does not have active class');
  });

  test('clicking selected futton does not fire toggle action', async function(assert) {
    assert.expect(4);

    const firstButton = '.first-button';
    const secondButton = '.second-button';
    const activeClass = 'active';

    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(hbs`{{click-choice-buttons
      toggle=(action toggle)
      firstChoicePicked=true
      buttonContent1='Left Button'
      buttonContent2='Right Button'
    }}`);

    assert.ok(find(firstButton).classList.contains(activeClass), 'first button has active class');
    assert.notOk(find(secondButton).classList.contains(activeClass), 'second button does not have active class');

    await click(firstButton);

    assert.ok(find(firstButton).classList.contains(activeClass), 'first button has active class');
    assert.notOk(find(secondButton).classList.contains(activeClass), 'second button does not have active class');
  });
});
