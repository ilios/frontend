import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | collapsed competencies', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);
    let schoolA = this.server.create('school', {title: 'Medicine'});
    let schoolB = this.server.create('school', {title: 'Pharmacy'});
    let competencyA = EmberObject.create(this.server.create('competency', { schoolId: 1 }));
    competencyA.school = RSVP.resolve(schoolA);
    let competencyB = EmberObject.create(this.server.create('competency', { schoolId: 2 }));
    competencyB.school = RSVP.resolve(schoolB);
    let competencies = [competencyA, competencyB];

    const course = EmberObject.create({
      competencies: RSVP.resolve(competencies)
    });

    this.set('course', course);
    this.actions.click = parseInt;
    await render(hbs`{{collapsed-competencies subject=course expand=(action 'click')}}`);
    return settled().then(() => {
      let content = this.$().text().trim();
      assert.equal(content.search(/Competencies \(2\)/), 0);
      assert.notEqual(content.search(/School(\s+)Competencies/), -1);
      assert.notEqual(content.search(/Medicine(\s+)1/), -1);
      assert.notEqual(content.search(/Pharmacy(\s+)1/), -1);
    });
  });

  test('clicking the header expands the list', async function(assert) {
    assert.expect(2);
    let schoolA = this.server.create('school', {title: 'Medicine'});
    let schoolB = this.server.create('school', {title: 'Pharmacy'});
    let competencyA = EmberObject.create(this.server.create('competency', { schoolId: 1 }));
    competencyA.school = RSVP.resolve(schoolA);
    let competencyB = EmberObject.create(this.server.create('competency', { schoolId: 2 }));
    competencyB.school = RSVP.resolve(schoolB);
    let competencies = [competencyA, competencyB];

    const course = EmberObject.create({
      competencies: RSVP.resolve(competencies)
    });

    this.set('course', course);
    this.actions.click = () => {
      assert.ok(true, 'Action was fired');
    };
    await render(hbs`{{collapsed-competencies subject=course expand=(action 'click')}}`);
    return settled().then(() => {
      assert.equal(this.$().text().trim().search(/Competencies \(2\)/), 0);
      this.$('.title').click();
    });
  });
});
