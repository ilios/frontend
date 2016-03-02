import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import startMirage from '../../helpers/start-mirage';
moduleForComponent('collapsed-taxonomies', 'Integration | Component | collapsed taxonomies', {
  integration: true,
  setup(){
    startMirage(this.container);
  }
});

test('display summary data', function(assert) {
  assert.expect(1);
  server.create('school', {
    vocabularies: [1],
  });
  server.createList('vocabulary', {
    terms: [1, 2, 3],
    school: 1,
  });
   server.createList('term', 3, {
    vocabulary: 1,
    courses: [1],

  });
  server.createList('term', 2, {
    vocabulary: 1,
  });

  const course = server.create('course', {
    terms: [1, 2, 3],
    school: 1,
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-taxonomies subject=subject expand=(action 'click')}}`);
  assert.equal(this.$('.detail-title').text().trim(), 'Terms (3)');
  // todo: flesh out tests. [ST 2016/03/01]
/*  assert.equal(this.$('table tr').length, 2);
  assert.equal(this.$('tr:eq(0) th:eq(0)').text().trim(), 'Vocabulary');
  assert.equal(this.$('tr:eq(0) th:eq(1)').text().trim(), 'School');
  assert.equal(this.$('tr:eq(0) th:eq(2)').text().trim(), 'Assigned terms');
  assert.equal(this.$('tr:eq(1) td:eq(0)').text().trim(), 'Vocabulary 1');
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'School 1');
  assert.equal(this.$('tr:eq(1) td:eq(2)').text().trim(), '3');*/
});
