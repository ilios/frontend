import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | school session type manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('assessment-option', {
      name: 'formative'
    });
    this.summative = this.server.create('assessment-option', {
      name: 'summative'
    });
  });

  test('it renders', async function(assert) {
    const sessionType = this.server.create('session-type', {
      title: 'one',
      calendarColor: '#ffffff',
      assessment: true,
      assessmentOption: this.summative,
      sessionCount: 0
    });
    const sessionTypeModel = await run(() => this.owner.lookup('service:store').find('session-type', sessionType.id));
    this.set('sessionType', sessionTypeModel);
    this.set('nothing', () => {});
    await render(hbs`{{school-session-type-manager
      canUpdate=true
      sessionType=sessionType
      close=(action nothing)
    }}`);

    const title = '[data-test-title]';
    const titleInput = `${title} input`;
    const color = '[data-test-color]';
    const colorInput = `${color} input`;
    const assessment = '[data-test-assessment]';
    const assessmentInput = `${assessment} input`;
    const assessmentOption = '[data-test-assessment-option]';
    const assessmentOptionSelect = `${assessmentOption} select`;

    assert.equal(find(titleInput).value.trim(), 'one');
    assert.equal(find(colorInput).value.trim(), '#ffffff');
    assert.dom(assessmentInput).isChecked();
    assert.dom(assessmentOptionSelect).hasValue('2');
  });

  test('close fires action', async function(assert) {
    assert.expect(1);
    const sessionType = this.server.create('session-type', {
      title: 'one',
      calendarColor: '#ffffff',
      assessment: true,
      assessmentOption: this.summative,
    });
    const sessionTypeModel = await run(() => this.owner.lookup('service:store').find('session-type', sessionType.id));
    this.set('sessionType', sessionTypeModel);
    this.set('close', ()=>{
      assert.ok(true, 'action was fired');
    });
    await render(hbs`{{school-session-type-manager
      canUpdate=true
      sessionType=sessionType
      close=(action close)
    }}`);

    const button = '.cancel';

    await click(button);
  });
});
