import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('detail-learning-materials', 'Integration | Component | detail learning materials', {
  integration: true
});

test('sort button visible when lm list has 2+ items and editing is allowed', function(assert){
  assert.expect(1);

  let clm1 = EmberObject.create({
    id: 1,
    learningMaterial: resolve(EmberObject.create({
      id: 1,
    }))
  });

  let clm2 = EmberObject.create({
    id: 2,
    learningMaterial: resolve(EmberObject.create({
      id: 2,
    }))
  });
  let clms = [ clm1, clm2 ];

  let subject = EmberObject.create({
    id: 1,
    learningMaterials: resolve(clms)
  });

  this.set('subject', subject);

  this.render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

  return wait().then(() => {
    assert.equal(this.$('.sort-materials-btn').length, 1);
  });
});

test('sort button not visible when in read-only mode', function(assert){
  assert.expect(1);

  let lm1 = EmberObject.create({
    id: 1,
  });

  let lm2 = EmberObject.create({
    id: 2,
  });
  let lms = [ lm1, lm2 ];

  let subject = EmberObject.create({
    id: 1,
    learningMaterials: resolve(lms)
  });

  this.set('subject', subject);

  this.render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=false }}`);

  return wait().then(() => {
    assert.equal(this.$('.sort-materials-btn').length, 0);
  });
});

test('sort button not visible when lm list is empty', function(assert){
  assert.expect(1);

  let subject = EmberObject.create({
    id: 1,
    learningMaterials: resolve([])
  });

  this.set('subject', subject);

  this.render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

  return wait().then(() => {
    assert.equal(this.$('.sort-materials-btn').length, 0);
  });
});

test('sort button not visible when lm list only contains one item', function(assert){
  let clm1 = EmberObject.create({
    id: 1,
    learningMaterial: resolve(EmberObject.create({
      id: 1,
    }))
  });

  let clms = [ clm1 ];

  let subject = EmberObject.create({
    id: 1,
    learningMaterials: resolve(clms)
  });

  this.set('subject', subject);

  this.render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

  return wait().then(() => {
    assert.equal(this.$('.sort-materials-btn').length, 0);
  });
});

test('click sort button, then cancel', function(assert){
  assert.expect(6);

  let clm1 = EmberObject.create({
    id: 1,
    learningMaterial: resolve(EmberObject.create({
      id: 1,
    }))
  });

  let clm2 = EmberObject.create({
    id: 2,
    learningMaterial: resolve(EmberObject.create({
      id: 2,
    }))
  });
  let clms = [ clm1, clm2 ];

  let subject = EmberObject.create({
    id: 1,
    learningMaterials: resolve(clms)
  });

  this.set('subject', subject);

  this.render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

  return wait().then(() => {
    assert.equal(this.$('.sort-materials-btn').length, 1, 'Sort materials button is visible');
    assert.equal(this.$('.learning-materials-sort-manager').length, 0, 'LM sort manager is not visible');

    this.$('.sort-materials-btn').click();
    return wait().then(() => {
      assert.equal(this.$('.sort-materials-btn').length, 0, 'Sort materials button is not visible');
      assert.equal(this.$('.learning-materials-sort-manager').length, 1, 'LM sort manager is visible');
      this.$('.learning-materials-sort-manager .bigcancel').click();
      return wait().then(() => {
        assert.equal(this.$('.sort-materials-btn').length, 1, 'Sort materials button is visible again');
        assert.equal(this.$('.learning-materials-sort-manager').length, 0, 'LM sort manager is not visible again');
      });
    });
  });
});

test('click sort button, then save', function(assert){
  assert.expect(2);

  let clm1 = EmberObject.create({
    id: 1,
    learningMaterial: resolve(EmberObject.create({
      id: 1,
    })),
    save() {
      assert.ok(true, 'Save() method was invoked');
      resolve(this);
    }
  });

  let clm2 = EmberObject.create({
    id: 2,
    learningMaterial: resolve(EmberObject.create({
      id: 2,
    })),
    save() {
      assert.ok(true, 'Save() method was invoked');
      resolve(this);
    }
  });
  let clms = [ clm1, clm2 ];

  let subject = EmberObject.create({
    id: 1,
    learningMaterials: resolve(clms)
  });

  this.set('subject', subject);

  this.render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

  return wait().then(() => {
    this.$('.sort-materials-btn').click();
    return wait().then(() => {
      this.$('.learning-materials-sort-manager .bigadd').click();
    });
  });
});
