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

    const offering1 = EmberObject.create({id: 1});
    const offering2 = EmberObject.create({id: 2});
    const offering3 = EmberObject.create({id: 3});

    const offerings1 = [ offering1, offering2 ];
    const offerings2 = [ offering3 ];
    const offerings3 = [];
    const offerings4 = [];


    const sessionType1 = EmberObject.create({ title: 'Lecture'});
    const sessionType2 = EmberObject.create({ title: 'Ceremony'});
    const sessionType3 = EmberObject.create({ title: 'Small Group'});
    const sessionType4 = EmberObject.create({ title: 'Rocket Surgery'});


    const totalTime1 = (30).toFixed(2);
    const totalTime2 = (15).toFixed(2);
    const totalTime3 = (0).toFixed(2);
    const totalTime4 = (0).toFixed(2);


    const session1 = EmberObject.create({
      id: 1,
      title: 'Aardvark',
      offerings: resolve(offerings1),
      sessionType: resolve(sessionType1),
      isIndependentLearning: false,
      maxDuration: resolve(totalTime1)
    });

    const session2 = EmberObject.create({
      id: 2,
      title: 'Bluebird',
      offerings: resolve(offerings2),
      sessionType: resolve(sessionType2),
      isIndependentLearning: false,
      totalSumDuration: resolve(totalTime2)
    });

    const session3 = EmberObject.create({
      id: 3,
      title: 'Zeppelin',
      offerings: resolve(offerings3),
      sessionType: resolve(sessionType3),
      isIndependentLearning: false,
      maxDuration: resolve(totalTime3)
    });

    const session4 = EmberObject.create({
      id: 4,
      title: 'Zwickzange',
      offerings: resolve(offerings4),
      sessionType: resolve(sessionType4),
      isIndependentLearning: true,
      totalSumDuration: resolve(totalTime4)
    });

    const linkedSessions = [session1, session3];
    const excludedSessions = [session4];
    const sessions = [session1, session2, session3, session4];

    const block = EmberObject.create({
      id: 1,
      sessions: resolve(linkedSessions),
      excludedSessions: resolve(excludedSessions),
    });

    this.set('sessions', resolve(sessions));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', function(){});
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);

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

    const block = EmberObject.create({
      id: 1,
      sessions: resolve([]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve([]));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', function(){});
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);
    assert.dom('thead tr').exists({ count: 1 }, 'Table header is visible,');
    assert.dom('tbody tr').doesNotExist('but table body is empty.');
  });

  test('sort by title', async function(assert) {
    assert.expect(1);
    const session = EmberObject.create({
      id: 1,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0)
    });

    const block = EmberObject.create({
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
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);
    await click(findAll('thead th')[2]);
  });

  test('sort by session type', async function(assert) {
    assert.expect(1);
    const session = EmberObject.create({
      id: 1,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0)
    });

    const block = EmberObject.create({
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
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);
    await click(findAll('thead th')[3]);
  });

  test('sort by offerings total', async function(assert) {
    assert.expect(1);
    const session = EmberObject.create({
      id: 1,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0)
    });

    const block = EmberObject.create({
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
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);
    await click(findAll('thead th')[5]);
  });

  test('change count as one offering', async function(assert) {
    assert.expect(3);
    const maxDuration = (20).toFixed(2);
    const totalSumDuration = (15).toFixed(2);
    const session = EmberObject.create({
      id: 1,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(maxDuration),
      totalSumDuration: resolve(totalSumDuration)
    });

    const block = EmberObject.create({
      id: 1,
      sessions: resolve([ session ]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve([ session ]));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'id');
    this.set('setSortBy', function(){});
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(maxDuration);
    await click('tbody tr:nth-of-type(1) td:nth-of-type(1) input');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(totalSumDuration);
    await click('tbody tr:nth-of-type(1) td:nth-of-type(1) input');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText(maxDuration);
  });

  test('change count as one offering for all sessions', async function(assert) {
    assert.expect(6);
    const maxDuration = (20).toFixed(2);
    const totalSumDuration = (15).toFixed(2);
    const session1 = EmberObject.create({
      id: 1,
      title: 'Alpha',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(maxDuration),
      totalSumDuration: resolve(totalSumDuration)
    });

    const session2 = EmberObject.create({
      id: 2,
      title: 'Omega',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(maxDuration),
      totalSumDuration: resolve(totalSumDuration)
    });

    const block = EmberObject.create({
      id: 1,
      sessions: resolve([ session1 ]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve([ session1, session2 ]));
    this.set('sequenceBlock', block);

    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
    />`);

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

    const session1 = EmberObject.create({
      id: 1,
      title: 'Alpha',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0),
      totalSumDuration: resolve(0)
    });

    const session2 = EmberObject.create({
      id: 2,
      title: 'Omega',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0),
      totalSumDuration: resolve(0)
    });

    const session3 = EmberObject.create({
      id: 3,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Thing'})),
      maxDuration: resolve(0),
      totalSumDuration: resolve(0)
    });

    const block = EmberObject.create({
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
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sortBy={{sortBy}}
      @sequenceBlock={{sequenceBlock}}
      @save={{action save}}
    />`);
    await click('tbody tr:nth-of-type(2) td:nth-of-type(1) input');
    await click('tbody tr:nth-of-type(1) td:nth-of-type(2) input');
    await click('tbody tr:nth-of-type(3) td:nth-of-type(2) input');
    await click('.actions .bigadd');
  });

  test('cancel', async function(assert) {
    assert.expect(1);

    const session = EmberObject.create({
      id: 1,
      title: 'Alpha',
      offerings: resolve([]),
      sessionType: resolve(EmberObject.create({ title: 'Lecture'})),
      maxDuration: resolve(0),
      totalSumDuration: resolve(0)
    });

    const block = EmberObject.create({
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
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @cancel={{action cancel}}
    />`);
    await click('.actions .bigcancel');
  });


  test('check all/uncheck all count-as-one', async function(assert) {
    assert.expect(15);

    const sessionType = EmberObject.create({ title: 'Lecture'});

    const session1 = EmberObject.create({
      id: 1,
      title: 'Aardvark',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    const session2 = EmberObject.create({
      id: 2,
      title: 'Bluebird',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    const session3 = EmberObject.create({
      id: 3,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    const session4 = EmberObject.create({
      id: 4,
      title: 'Zwickzange',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: true,
      totalSumDuration: resolve(0)
    });

    const session5 = EmberObject.create({
      id: 4,
      title: 'Zylinder',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: true,
      totalSumDuration: resolve(0)
    });

    const sessions = [session1, session2, session3, session4, session5];

    const block = EmberObject.create({
      id: 1,
      sessions: resolve([session5]),
      excludedSessions: resolve([]),
    });

    this.set('sessions', resolve(sessions));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', function(){});
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);

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

    const sessionType = EmberObject.create({ title: 'Lecture'});

    const session1 = EmberObject.create({
      id: 1,
      title: 'Aardvark',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    const session2 = EmberObject.create({
      id: 2,
      title: 'Bluebird',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    const session3 = EmberObject.create({
      id: 3,
      title: 'Zeppelin',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: false,
      totalSumDuration: resolve(0)
    });

    const session4 = EmberObject.create({
      id: 4,
      title: 'Zwickzange',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: true,
      totalSumDuration: resolve(0)
    });

    const session5 = EmberObject.create({
      id: 4,
      title: 'Zylinder',
      offerings: resolve([]),
      sessionType: resolve(sessionType),
      isIndependentLearning: true,
      totalSumDuration: resolve(0)
    });

    const sessions = [session1, session2, session3, session4, session5];

    const block = EmberObject.create({
      id: 1,
      sessions: resolve([]),
      excludedSessions: resolve([session5]),
    });

    this.set('sessions', resolve(sessions));
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortBy', function(){});
    await render(hbs`<CurriculumInventorySequenceBlockSessionManager
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);

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
