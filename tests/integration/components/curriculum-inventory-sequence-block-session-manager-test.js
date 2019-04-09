import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';


const { resolve } = RSVP;

module('Integration | Component | curriculum inventory sequence block session manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(33);

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
      maxDuration: resolve(totalTime1)
    });

    let session2 = EmberObject.create({
      id: 2,
      title: 'Bluebird',
      offerings: resolve(offerings2),
      sessionType: resolve(sessionType2),
      isIndependentLearning: false,
      totalSumDuration: resolve(totalTime2)
    });

    let session3 = EmberObject.create({
      id: 3,
      title: 'Zeppelin',
      offerings: resolve(offerings3),
      sessionType: resolve(sessionType3),
      isIndependentLearning: false,
      maxDuration: resolve(totalTime3)
    });

    let session4 = EmberObject.create({
      id: 4,
      title: 'Zwickzange',
      offerings: resolve(offerings4),
      sessionType: resolve(sessionType4),
      isIndependentLearning: true,
      totalSumDuration: resolve(totalTime4)
    });

    let linkedSessions = [session1, session3];
    let excludedSessions = [session4];
    let sessions = [session1, session2, session3, session4];

    let block = EmberObject.create({
      id: 1,
      sessions: resolve(linkedSessions),
      excludedSessions: resolve(excludedSessions),
    });

    this.set('sessions', resolve(sessions));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', function(){});
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`
    );

    assert.dom('.actions .bigadd').exists({ count: 1 }, 'Save button is visible.');
    assert.dom('.actions .bigcancel').exists({ count: 1 }, 'Cancel button is visible.');

    assert.dom('thead th').hasText('Count as one offering', 'Column header is labeled correctly.');
    assert.dom(findAll('thead th')[1]).hasText('Exclude', 'Column header is labeled correctly.');
    assert.dom(findAll('thead th')[2]).hasText('Session Title', 'Column header is labeled correctly.');
    assert.dom(findAll('thead th')[3]).hasText('Session Type', 'Column header is labeled correctly.');
    assert.dom(findAll('thead th')[4]).hasText('Total time', 'Column header is labeled correctly.');
    assert.dom(findAll('thead th')[5]).hasText('Offerings', 'Column header is labeled correctly.');

    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(1) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(2) input').isNotChecked('Excluded is not checked.');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[2]).hasText(session1.get('title'), 'Session title is shown.');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[3]).hasText(sessionType1.get('title'), 'Session type is visible.');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(totalTime1, 'Total time is shown.');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[5]).hasText(offerings1.length.toString(), 'Number of offerings is shown.');

    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(2) input').isNotChecked('Excluded is not checked.');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[2]).hasText(session2.get('title'), 'Title is visible.');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[3]).hasText(sessionType2.get('title'), 'Session type is visible.');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[4]).hasText(totalTime2, 'Total time is shown.');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[5]).hasText(offerings2.length.toString(), 'Number of offerings is shown.');

    assert.dom('tbody tr:nth-of-type(3) td:nth-of-type(1) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(3) td:nth-of-type(2) input').isNotChecked('Excluded is not checked.');
    assert.dom(findAll('tbody tr:nth-of-type(3) td')[2]).hasText(session3.get('title'), 'Title is visible.');
    assert.dom(findAll('tbody tr:nth-of-type(3) td')[3]).hasText(sessionType3.get('title'), 'Session type is visible.');
    assert.dom(findAll('tbody tr:nth-of-type(3) td')[4]).hasText(totalTime3, 'Total time is shown.');
    assert.dom(findAll('tbody tr:nth-of-type(3) td')[5]).hasText(offerings3.length.toString(), 'Number of offerings is shown.');

    assert.dom('tbody tr:nth-of-type(4) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(4) td:nth-of-type(2) input').isChecked('Excluded is checked.');
    assert.ok(findAll('tbody tr:nth-of-type(4) td')[2].textContent.trim().startsWith('(ILM)'), 'ILM is labeled as such.');
    assert.ok(findAll('tbody tr:nth-of-type(4) td')[2].textContent.trim().endsWith(session4.get('title')), 'Title is visible.');
    assert.dom(findAll('tbody tr:nth-of-type(4) td')[3]).hasText(sessionType4.get('title'), 'Session type is visible.');
    assert.dom(findAll('tbody tr:nth-of-type(4) td')[4]).hasText(totalTime4, 'Total time is shown.');
    assert.dom(findAll('tbody tr:nth-of-type(4) td')[5]).hasText(offerings4.length.toString(), 'Number of offerings is shown.');
  });

  test('empty list', async function(assert) {
    assert.expect(2);

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve([]));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', function(){});
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`
    );
    assert.dom('thead tr').exists({ count: 1 }, 'Table header is visible,');
    assert.dom('tbody tr').doesNotExist('but table body is empty.');
  });

  test('sort by title', async function(assert) {
    assert.expect(1);
    let session = EmberObject.create({
      id: 1,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0)
    });

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([ session ]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve([ session ]));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'id');
    this.set('setSortBy', function(what){
      assert.equal(what, 'title', "Sorting callback gets called for session titles.");
    });
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`
    );
    await click(findAll('thead th')[2]);
  });

  test('sort by session type', async function(assert) {
    assert.expect(1);
    let session = EmberObject.create({
      id: 1,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0)
    });

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([ session ]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve([ session ]));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'id');
    this.set('setSortBy', function(what){
      assert.equal(what, 'sessionType.title', "Sorting callback gets called for session type titles.");
    });
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`
    );
    await click(findAll('thead th')[3]);
  });

  test('sort by offerings total', async function(assert) {
    assert.expect(1);
    let session = EmberObject.create({
      id: 1,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0)
    });

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([ session ]),
      excludedSessions: resolve([]),

    });

    this.set('sessions', resolve([ session ]));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'id');
    this.set('setSortBy', function(what){
      assert.equal(what, 'offerings.length', "Sorting callback gets called for offerings length.");
    });
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`
    );
    await click(findAll('thead th')[5]);
  });

  test('change count as one offering', async function(assert) {
    assert.expect(3);
    let maxDuration = (20).toFixed(2);
    let totalSumDuration = (15).toFixed(2);
    let session = EmberObject.create({
      id: 1,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(maxDuration),
      totalSumDuration: resolve(totalSumDuration)
    });

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([ session ]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve([ session ]));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'id');
    this.set('setSortBy', function(){});
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`
    );
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(maxDuration);
    await click('tbody tr:nth-of-type(1) td:nth-of-type(1) input');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(totalSumDuration);
    await click('tbody tr:nth-of-type(1) td:nth-of-type(1) input');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(maxDuration);
  });

  test('change count as one offering for all sessions', async function(assert) {
    assert.expect(6);
    let maxDuration = (20).toFixed(2);
    let totalSumDuration = (15).toFixed(2);
    let session1 = EmberObject.create({
      id: 1,
      title: 'Alpha',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(maxDuration),
      totalSumDuration: resolve(totalSumDuration)
    });

    let session2 = EmberObject.create({
      id: 2,
      title: 'Omega',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(maxDuration),
      totalSumDuration: resolve(totalSumDuration)
    });

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([ session1 ]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve([ session1, session2 ]));
    this.set('sequenceBlock', block);

    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock }}`
    );

    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(maxDuration);
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[4]).hasText(totalSumDuration);

    await click('thead tr:nth-of-type(1) th:nth-of-type(1) input');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(maxDuration);
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[4]).hasText(maxDuration);

    await click('thead tr:nth-of-type(1) th:nth-of-type(1) input');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(totalSumDuration);
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[4]).hasText(totalSumDuration);
  });

  test('save', async function(assert) {
    assert.expect(6);

    let session1 = EmberObject.create({
      id: 1,
      title: 'Alpha',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0),
      totalSumDuration: resolve(0)
    });

    let session2 = EmberObject.create({
      id: 2,
      title: 'Omega',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0),
      totalSumDuration: resolve(0)
    });

    let session3 = EmberObject.create({
      id: 3,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Thing'})),
      maxDuration: resolve(0),
      totalSumDuration: resolve(0)
    });

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([ session1 ]),
      excludedSessions: resolve([ session2, session3 ])
    });

    this.set('sessions', resolve([ session1, session2, session3 ]));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('save', (sessions, excludedSessions) => {
      assert.equal(sessions.length, 2);
      assert.ok(sessions.includes(session1));
      assert.ok(sessions.includes(session2));
      assert.equal(excludedSessions.length, 2);
      assert.ok(excludedSessions.includes(session1));
      assert.ok(excludedSessions.includes(session2));
    });
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sortBy=sortBy sequenceBlock=sequenceBlock save=(action save)}}`
    );
    await click('tbody tr:nth-of-type(2) td:nth-of-type(1) input');
    await click('tbody tr:nth-of-type(1) td:nth-of-type(2) input');
    await click('tbody tr:nth-of-type(3) td:nth-of-type(2) input');
    await click('.actions .bigadd');
  });

  test('cancel', async function(assert) {
    assert.expect(1);

    let session = EmberObject.create({
      id: 1,
      title: 'Alpha',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0),
      totalSumDuration: resolve(0)
    });

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([ session ]),
      excludedSessions: resolve([])
    });

    this.set('sessions', resolve([ session ]));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('cancel', () => {
      assert.ok(true, 'Cancel action fired.');
    });
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy cancel=(action cancel)}}`
    );
    await click('.actions .bigcancel');
  });


  test('check all/uncheck all count-as-one', async function(assert) {
    assert.expect(15);

    let sessionType = EmberObject.create({ title: 'Lecture'});

    let session1 = EmberObject.create({
      id: 1,
      title: 'Aardvark',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    let session2 = EmberObject.create({
      id: 2,
      title: 'Bluebird',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    let session3 = EmberObject.create({
      id: 3,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    let session4 = EmberObject.create({
      id: 4,
      title: 'Zwickzange',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: true,
      totalSumDuration: resolve(0)
    });

    let session5 = EmberObject.create({
      id: 4,
      title: 'Zylinder',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: true,
      totalSumDuration: resolve(0)
    });

    let sessions = [session1, session2, session3, session4, session5];

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([session5]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve(sessions));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', function(){});
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`
    );

    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(3) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(4) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(5) td:nth-of-type(1) input').isChecked('Count offerings as one is checked.');

    await click('thead tr:nth-of-type(1) th:nth-of-type(1) input');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(1) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(1) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(3) td:nth-of-type(1) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(4) td:nth-of-type(1) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(5) td:nth-of-type(1) input').isChecked('Count offerings as one is checked.');

    await click('thead tr:nth-of-type(1) th:nth-of-type(1) input');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(3) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(4) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(5) td:nth-of-type(1) input').isNotChecked('Count offerings as one is un-checked.');
  });


  test('check all/uncheck all excluded', async function(assert) {
    assert.expect(15);

    let sessionType = EmberObject.create({ title: 'Lecture'});

    let session1 = EmberObject.create({
      id: 1,
      title: 'Aardvark',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    let session2 = EmberObject.create({
      id: 2,
      title: 'Bluebird',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    let session3 = EmberObject.create({
      id: 3,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    let session4 = EmberObject.create({
      id: 4,
      title: 'Zwickzange',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: true,
      totalSumDuration: resolve(0)
    });

    let session5 = EmberObject.create({
      id: 4,
      title: 'Zylinder',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: true,
      totalSumDuration: resolve(0)
    });

    let sessions = [session1, session2, session3, session4, session5];

    let block = EmberObject.create({
      id: 1,
      sessions: resolve([]),
      excludedSessions: resolve([session5]),
    });

    this.set('sessions', resolve(sessions));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', function(){});
    await render(
      hbs`{{curriculum-inventory-sequence-block-session-manager sessions=sessions sequenceBlock=sequenceBlock sortBy=sortBy setSortBy=setSortBy}}`
    );

    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(2) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(2) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(3) td:nth-of-type(2) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(4) td:nth-of-type(2) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(5) td:nth-of-type(2) input').isChecked('Count offerings as one is checked.');

    await click('thead tr:nth-of-type(1) th:nth-of-type(2) input');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(2) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(2) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(3) td:nth-of-type(2) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(4) td:nth-of-type(2) input').isChecked('Count offerings as one is checked.');
    assert.dom('tbody tr:nth-of-type(5) td:nth-of-type(2) input').isChecked('Count offerings as one is checked.');

    await click('thead tr:nth-of-type(1) th:nth-of-type(2) input');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(2) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(2) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(3) td:nth-of-type(2) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(4) td:nth-of-type(2) input').isNotChecked('Count offerings as one is un-checked.');
    assert.dom('tbody tr:nth-of-type(5) td:nth-of-type(2) input').isNotChecked('Count offerings as one is un-checked.');
  });
});

