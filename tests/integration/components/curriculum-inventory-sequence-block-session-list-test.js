import { getOwner } from '@ember/application';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { moduleForComponent } from 'ember-qunit';
import { test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/load-common-translations";

const { resolve } = RSVP;
moduleForComponent('curriculum-inventory-sequence-block-session-list', 'Integration | Component | curriculum inventory sequence block session list', {
  integration: true,
  setup(){
    initializer.initialize(getOwner(this));
  },
  beforeEach: function () {
    getOwner(this).lookup('service:i18n').set('locale', 'en');
  }
});

test('it renders', async function(assert) {
  assert.expect(26);

  let offering1 = EmberObject.create({id: 1});
  let offering2 = EmberObject.create({id: 2});
  let offering3 = EmberObject.create({id: 3});

  let offerings1 = [ offering1, offering2 ];
  let offerings2 = [ offering3 ];
  let offerings3 = [];
  let offerings4 = [];


  let sessionType1 = EmberObject.create({ title: 'Lecture'});
  let sessionType2 = EmberObject.create({ title: 'Ceremony'});
  let sessionType3 = EmberObject.create({ title: 'Small Group'});
  let sessionType4 = EmberObject.create({ title: 'Rocket Surgery'});


  let totalTime1 = (30).toFixed(2);
  let totalTime2 = (15).toFixed(2);
  let totalTime3 = (0).toFixed(2);
  let totalTime4 = (0).toFixed(2);


  let session1 = EmberObject.create({
    id: 1,
    title: 'Aardvark',
    offerings: resolve(offerings1),
    sessionType: resolve(sessionType1),
    isIndependentLearning: false,
    maxSingleOfferingDuration: resolve(totalTime1)
  });

  let session2 = EmberObject.create({
    id: 2,
    title: 'Bluebird',
    offerings: resolve(offerings2),
    sessionType: resolve(sessionType2),
    isIndependentLearning: false,
    totalSumOfferingsDuration: resolve(totalTime2)
  });

  let session3 = EmberObject.create({
    id: 3,
    title: 'Zeppelin',
    offerings: resolve(offerings3),
    sessionType: resolve(sessionType3),
    isIndependentLearning: false,
    maxSingleOfferingDuration: resolve(totalTime3)
  });

  let session4 = EmberObject.create({
    id: 4,
    title: 'Zwickzange',
    offerings: resolve(offerings4),
    sessionType: resolve(sessionType4),
    isIndependentLearning: true,
    totalSumOfferingsDuration: resolve(totalTime4)
  });

  let sessions = [session1, session2, session3, session4];

  let block = EmberObject.create({
    id: 1,
    sessions: resolve([session1, session3]),
  });

  this.set('sessions', resolve(sessions));
  this.set('sequenceBlock', block);
  this.set('sortBy', 'title');
  this.set('setSortBy', function(){});
  await this.render(hbs`{{curriculum-inventory-sequence-block-session-list sessions=(await sessions) sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
  assert.equal(this.$('thead th:eq(0)').text().trim(), 'Count as one offering', 'Column header is labeled correctly.');
  assert.equal(this.$('thead th:eq(1)').text().trim(), 'Session Title', 'Column header is labeled correctly.');
  assert.equal(this.$('thead th:eq(2)').text().trim(), 'Session Type', 'Column header is labeled correctly.');
  assert.equal(this.$('thead th:eq(3)').text().trim(), 'Total time', 'Column header is labeled correctly.');
  assert.equal(this.$('thead th:eq(4)').text().trim(), 'Offerings', 'Column header is labeled correctly.');

  assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), 'Yes', 'All offerings in session are counted as one.');
  assert.equal(this.$('tbody tr:eq(0) td:eq(1)').text().trim(), session1.get('title'), 'Session title is shown.');
  assert.equal(this.$('tbody tr:eq(0) td:eq(2)').text().trim(), sessionType1.get('title'), 'Session type title is shown.');
  assert.equal(this.$('tbody tr:eq(0) td:eq(3)').text().trim(), totalTime1, 'Total time is shown.');
  assert.equal(this.$('tbody tr:eq(0) td:eq(4)').text().trim(), offerings1.length, 'Number of offerings is shown.');

  assert.equal(this.$('tbody tr:eq(1) td:eq(0)').text().trim(), 'No', 'All offerings are counted individually.');
  assert.equal(this.$('tbody tr:eq(1) td:eq(1)').text().trim(), session2.get('title'), 'Title is visible.');
  assert.equal(this.$('tbody tr:eq(1) td:eq(2)').text().trim(), sessionType2.get('title'), 'Session type is visible.');
  assert.equal(this.$('tbody tr:eq(1) td:eq(3)').text().trim(), totalTime2, 'Total time is shown.');
  assert.equal(this.$('tbody tr:eq(1) td:eq(4)').text().trim(), offerings2.length, 'Number of offerings is shown.');

  assert.equal(this.$('tbody tr:eq(2) td:eq(0)').text().trim(), 'Yes', 'All offerings in session are counted as one.');
  assert.equal(this.$('tbody tr:eq(2) td:eq(1)').text().trim(), session3.get('title'), 'Title is visible.');
  assert.equal(this.$('tbody tr:eq(2) td:eq(2)').text().trim(), sessionType3.get('title'), 'Session type is visible.');
  assert.equal(this.$('tbody tr:eq(2) td:eq(3)').text().trim(), totalTime3, 'Total time is shown.');
  assert.equal(this.$('tbody tr:eq(2) td:eq(4)').text().trim(), offerings3.length, 'Number of offerings is shown.');

  assert.equal(this.$('tbody tr:eq(3) td:eq(0)').text().trim(), 'No', 'All offerings are counted individually.');
  assert.ok(this.$('tbody tr:eq(3) td:eq(1)').text().trim().startsWith('(ILM)'), 'ILMs is labeled as such.');
  assert.ok(this.$('tbody tr:eq(3) td:eq(1)').text().trim().endsWith(session4.get('title')), 'Title is visible.');
  assert.equal(this.$('tbody tr:eq(3) td:eq(2)').text().trim(), sessionType4.get('title'), 'Session type is visible.');
  assert.equal(this.$('tbody tr:eq(3) td:eq(3)').text().trim(), totalTime4, 'Total time is shown.');
  assert.equal(this.$('tbody tr:eq(3) td:eq(4)').text().trim(), offerings4.length, 'Number of offerings is shown.');
});

test('empty list', async function(assert) {
  assert.expect(2);

  let block = EmberObject.create({
    id: 1,
    sessions: resolve([]),
  });

  this.set('sessions', resolve([]));
  this.set('sequenceBlock', block);
  this.set('sortBy', 'title');
  this.set('setSortBy', function(){});
  await this.render(hbs`{{curriculum-inventory-sequence-block-session-list sessions=(await sessions) sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
  assert.equal(this.$('thead tr').length, 1, 'Table header is visible,');
  assert.equal(this.$('tbody tr').length, 0, 'but table body is empty.');
});

test('sort by title', async function(assert) {
  assert.expect(1);
  let session = EmberObject.create({
    id: 1,
    title: 'Zeppelin',
    offerings: resolve([]),
    sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
    maxSingleOfferingDuration: resolve(0)
  });

  let block = EmberObject.create({
    id: 1,
    sessions: resolve([ session ]),
  });

  this.set('sessions', resolve([ session ]));
  this.set('sequenceBlock', block);
  this.set('sortBy', 'id');
  this.set('setSortBy', function(what){
    assert.equal(what, 'title', "Sorting callback gets called for session titles.");
  });
  await this.render(hbs`{{curriculum-inventory-sequence-block-session-list sessions=(await sessions) sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
  this.$('thead th:eq(1)').click();
});

test('sort by session type', async function(assert) {
  assert.expect(1);
  let session = EmberObject.create({
    id: 1,
    title: 'Zeppelin',
    offerings: resolve([]),
    sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
    maxSingleOfferingDuration: resolve(0)
  });

  let block = EmberObject.create({
    id: 1,
    sessions: resolve([ session ]),
  });

  this.set('sessions', resolve([ session ]));
  this.set('sequenceBlock', block);
  this.set('sortBy', 'id');
  this.set('setSortBy', function(what){
    assert.equal(what, 'sessionType.title', "Sorting callback gets called for session type titles.");
  });
  await this.render(hbs`{{curriculum-inventory-sequence-block-session-list sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
  this.$('thead th:eq(2)').click();
});

test('sort by offerings total', async function(assert) {
  assert.expect(1);
  let session = EmberObject.create({
    id: 1,
    title: 'Zeppelin',
    offerings: resolve([]),
    sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
    maxSingleOfferingDuration: resolve(0)
  });

  let block = EmberObject.create({
    id: 1,
    sessions: resolve([ session ]),
  });

  this.set('sessions', resolve([ session ]));
  this.set('sequenceBlock', block);
  this.set('sortBy', 'id');
  this.set('setSortBy', function(what){
    assert.equal(what, 'offerings.length', "Sorting callback gets called for offerings length.");
  });
  await this.render(hbs`{{curriculum-inventory-sequence-block-session-list sessions=(await sessions) sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`);
  this.$('thead th:eq(4)').click();
});
