import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;
let storeMock;
const formative = EmberObject.create({
  id: 1,
  name: 'formative'
});
const summative = EmberObject.create({
  id: 2,
  name: 'summative'
});
const assessmentOptions = [formative, summative];

module('Integration | Component | school session type manager', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    storeMock = Service.extend({
      findAll(what){
        if (what === 'assessment-option') {
          return resolve(assessmentOptions);
        }
      }
    });
    this.owner.register('service:store', storeMock);
  });

  test('it renders', async function(assert) {
    const sessionType = EmberObject.create({
      title: 'one',
      calendarColor: '#ffffff',
      assessment: true,
      assessmentOption: resolve(summative),
      sessionCount: 0
    });
    this.set('sessionType', sessionType);
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-type-manager
      sessionType=sessionType
      close=(action nothing)
    }}`);

    await settled();

    const title = '.item:eq(0)';
    const titleInput = `${title} input`;
    const color = '.item:eq(2)';
    const colorInput = `${color} input`;
    const assessment = '.item:eq(3)';
    const assessmentInput = `${assessment} input`;
    const assessmentOption = '.item:eq(4)';
    const assessmentOptionSelect = `${assessmentOption} select`;

    assert.equal(this.$(titleInput).val().trim(), 'one');
    assert.equal(this.$(colorInput).val().trim(), '#ffffff');
    assert.ok(this.$(assessmentInput).is(':checked'));
    assert.equal(this.$(assessmentOptionSelect).val(), '2');
  });

  test('close fires action', async function(assert) {
    assert.expect(1);
    const sessionType = EmberObject.create({
      title: 'one',
      calendarColor: '#ffffff',
      assessment: true,
      assessmentOption: resolve(summative),
    });
    this.set('sessionType', sessionType);
    this.set('close', ()=>{
      assert.ok(true, 'action was fired');
    });
    await render(hbs`{{school-session-type-manager
      sessionType=sessionType
      close=(action close)
    }}`);

    const button = '.cancel';

    await settled();

    this.$(button).click();
  });
});
