import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | toggle buttons', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(6);

    const firstLabel = 'label:nth-of-type(1)';
    const firstRadio = 'input:nth-of-type(1)';
    const secondLabel = 'label:nth-of-type(2)';
    const secondRadio = 'input:nth-of-type(2)';

    this.set('nothing', parseInt);
    await render(hbs`{{toggle-buttons
      action=(action nothing)
      firstOptionSelected=true
      firstLabel='First'
      firstIcon='user'
      secondLabel='Second'
      secondIcon='expand'
    }}`);
    assert.dom(firstLabel).hasText('First', 'first label has correct text');
    assert.ok(find(firstRadio).checked, 'first radio is checked');
    assert.equal(find(firstLabel).getAttribute('for'), find(firstRadio).id, 'first label is linked to radio correctly');

    assert.dom(secondLabel).hasText('Second', 'second label has correct text');
    assert.notOk(find(secondRadio).checked, 'second radio is not checked');
    assert.equal(find(secondLabel).getAttribute('for'), find(secondRadio).id, 'second label is linked to radio correctly');

  });

  test('clicking radio fires toggle action', async function(assert) {
    assert.expect(2);

    const first = 'input:nth-of-type(1)';
    const second = 'input:nth-of-type(2)';

    this.set('firstOptionSelected', true);
    let called = 0;
    this.set('toggle', (newValue) => {
      if (called === 0) {
        assert.notOk(newValue, 'has not been toggled yet');
      } else {
        assert.ok(newValue, 'has been toggled');
      }
      this.set('firstOptionSelected', newValue);
      called ++;
    });
    await render(hbs`{{toggle-buttons
      toggle=(action toggle)
      firstOptionSelected=firstOptionSelected
      firstLabel='Left'
      secondLabel='Right'
    }}`);

    await click(second);
    await click(first);
  });

  test('clicking selected radio does not fire toggle action', async function(assert) {
    assert.expect(1);

    const first = 'input:nth-of-type(1)';

    this.set('firstOptionSelected', true);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(hbs`{{toggle-buttons
      toggle=(action toggle)
      firstOptionSelected=firstOptionSelected
      firstLabel='Left'
      secondLabel='Right'
    }}`);

    await click(first);
    assert.equal(this.get('firstOptionSelected'), true);
  });
});
