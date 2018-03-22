import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | toggle icons', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(9);

    const firstLabel = 'label:nth-of-type(1)';
    const firstRadio = 'input:nth-of-type(1)';
    const secondLabel = 'label:nth-of-type(2)';
    const secondRadio = 'input:nth-of-type(2)';
    const icon = 'i:nth-of-type(1)';

    this.set('nothing', parseInt);
    await render(hbs`{{toggle-icons
      action=(action nothing)
      firstOptionSelected=true
      firstLabel='First'
      firstIcon='user'
      secondLabel='Second'
      secondIcon='expand'
    }}`);
    assert.equal(this.$(firstLabel).text().trim(), 'First', 'first label has correct text');
    assert.ok(this.$(firstRadio).is(':checked'), 'first radio is checked');
    assert.equal(this.$(firstLabel).attr('for'), this.$(firstRadio).attr('id'), 'first label is linked to radio correctly');

    assert.equal(this.$(secondLabel).text().trim(), 'Second', 'second label has correct text');
    assert.notOk(this.$(secondRadio).is(':checked'), 'second radio is not checked');
    assert.equal(this.$(secondLabel).attr('for'), this.$(secondRadio).attr('id'), 'second label is linked to radio correctly');

    assert.equal(this.$(icon).length, 1);
    assert.ok(this.$(icon).hasClass('fa-user'), 'correct icon is visible');
    assert.equal(this.$(icon).attr('title').trim(), 'Second', 'Title text is correct');
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
    await render(hbs`{{toggle-icons
      toggle=(action toggle)
      firstOptionSelected=firstOptionSelected
      firstLabel='Left'
      secondLabel='Right'
    }}`);

    this.$(second).click();
    this.$(first).click();
  });

  test('clicking selected radio does not fire toggle action', async function(assert) {
    assert.expect(1);

    const first = 'input:nth-of-type(1)';

    this.set('firstOptionSelected', true);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(hbs`{{toggle-icons
      toggle=(action toggle)
      firstOptionSelected=firstOptionSelected
      firstLabel='Left'
      secondLabel='Right'
    }}`);

    this.$(first).click();
    assert.equal(this.get('firstOptionSelected'), true);
  });

  test('clicking icon fires toggle action', async function(assert) {
    assert.expect(8);

    const icon = 'i:nth-of-type(1)';

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
    await render(hbs`{{toggle-icons
      toggle=(action toggle)
      firstOptionSelected=firstOptionSelected
      firstLabel='First'
      firstIcon='user'
      secondLabel='Second'
      secondIcon='expand'
    }}`);

    assert.ok(this.$(icon).hasClass('fa-user'));
    assert.equal(this.$(icon).attr('title').trim(), 'Second', 'Title text is correct');
    this.$(icon).click();
    assert.ok(this.$(icon).hasClass('fa-expand'));
    assert.equal(this.$(icon).attr('title').trim(), 'First', 'Title text is correct');
    this.$(icon).click();
    assert.ok(this.$(icon).hasClass('fa-user'));
    assert.equal(this.$(icon).attr('title').trim(), 'Second', 'Title text is correct');
  });
});
