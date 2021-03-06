import { setupRenderingTest } from 'ember-qunit';
import { findAll, click, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import moment from 'moment';

module(
  'Integration | Component | curriculum inventory sequence block session list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);
    setupMirage(hooks);

    test('it renders', async function (assert) {
      assert.expect(31);
      const now = moment().toDate();
      const in15Hours = moment().add(15, 'hours').toDate();
      const in30Hours = moment().add(30, 'hours').toDate();

      const offering1 = this.server.create('offering', {
        startDate: now,
        endDate: in30Hours,
      });
      const offering2 = this.server.create('offering', {
        startDate: now,
        endDate: in15Hours,
      });
      const offering3 = this.server.create('offering', {
        startDate: now,
        endDate: in15Hours,
      });

      const sessionType1 = this.server.create('session-type', { title: 'Lecture' });
      const sessionType2 = this.server.create('session-type', { title: 'Ceremony' });
      const sessionType3 = this.server.create('session-type', { title: 'Small Group' });
      const sessionType4 = this.server.create('session-type', { title: 'Rocket Surgery' });

      const session1 = this.server.create('session', {
        title: 'Aardvark',
        offerings: [offering1, offering2],
        sessionType: sessionType1,
      });

      const session2 = this.server.create('session', {
        title: 'Bluebird',
        offerings: [offering3],
        sessionType: sessionType2,
      });

      const session3 = this.server.create('session', {
        title: 'Zeppelin',
        sessionType: sessionType3,
      });
      const ilmSession = this.server.create('ilm-session', {
        hours: 0,
      });
      const session4 = this.server.create('session', {
        title: 'Zwickzange',
        sessionType: sessionType4,
        ilmSession,
      });

      const block = this.server.create('curriculum-inventory-sequence-block', {
        sessions: [session1, session3],
        excludedSessions: [session2],
      });
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'title');
      await this.render(hbs`<CurriculumInventorySequenceBlockSessionList
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{noop}}
      @setSortBy={{setSortBy}}
    />`);
      assert
        .dom('thead th')
        .hasText('Count as one offering', 'Column header is labeled correctly.');
      assert.dom(findAll('thead th')[1]).hasText('Exclude', 'Column header is labeled correctly.');
      assert
        .dom(findAll('thead th')[2])
        .hasText('Session Title', 'Column header is labeled correctly.');
      assert
        .dom(findAll('thead th')[3])
        .hasText('Session Type', 'Column header is labeled correctly.');
      assert
        .dom(findAll('thead th')[4])
        .hasText('Total time', 'Column header is labeled correctly.');
      assert
        .dom(findAll('thead th')[5])
        .hasText('Offerings', 'Column header is labeled correctly.');

      assert
        .dom('tbody tr:nth-of-type(1) td')
        .hasText('Yes', 'All offerings in session are counted as one.');
      assert
        .dom(findAll('tbody tr:nth-of-type(1) td')[1])
        .hasText('No', 'Excluded value is shown.');
      assert
        .dom(findAll('tbody tr:nth-of-type(1) td')[2])
        .hasText(session1.title, 'Session title is shown.');
      assert
        .dom(findAll('tbody tr:nth-of-type(1) td')[3])
        .hasText(sessionType1.title, 'Session type title is shown.');
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[4]).hasText('30.00', 'Total time is shown.');
      assert
        .dom(findAll('tbody tr:nth-of-type(1) td')[5])
        .hasText('2', 'Number of offerings is shown.');

      assert
        .dom('tbody tr:nth-of-type(2) td')
        .hasText('No', 'All offerings are counted individually.');
      assert
        .dom(findAll('tbody tr:nth-of-type(2) td')[1])
        .hasText('Yes', 'Excluded value is shown.');
      assert
        .dom(findAll('tbody tr:nth-of-type(2) td')[2])
        .hasText(session2.title, 'Title is visible.');
      assert
        .dom(findAll('tbody tr:nth-of-type(2) td')[3])
        .hasText(sessionType2.title, 'Session type is visible.');
      assert.dom(findAll('tbody tr:nth-of-type(2) td')[4]).hasText('15.00', 'Total time is shown.');
      assert
        .dom(findAll('tbody tr:nth-of-type(2) td')[5])
        .hasText('1', 'Number of offerings is shown.');

      assert
        .dom('tbody tr:nth-of-type(3) td')
        .hasText('Yes', 'All offerings in session are counted as one.');
      assert
        .dom(findAll('tbody tr:nth-of-type(3) td')[1])
        .hasText('No', 'Excluded value is shown.');
      assert
        .dom(findAll('tbody tr:nth-of-type(3) td')[2])
        .hasText(session3.title, 'Title is visible.');
      assert
        .dom(findAll('tbody tr:nth-of-type(3) td')[3])
        .hasText(sessionType3.title, 'Session type is visible.');
      assert.dom(findAll('tbody tr:nth-of-type(3) td')[4]).hasText('0', 'Total time is shown.');
      assert
        .dom(findAll('tbody tr:nth-of-type(3) td')[5])
        .hasText('0', 'Number of offerings is shown.');

      assert
        .dom('tbody tr:nth-of-type(4) td')
        .hasText('No', 'All offerings are counted individually.');
      assert
        .dom(findAll('tbody tr:nth-of-type(4) td')[1])
        .hasText('No', 'Excluded value is shown.');
      assert.ok(
        find(findAll('tbody tr:nth-of-type(4) td')[2]).textContent.trim().startsWith('(ILM)'),
        'ILMs is labeled as such.'
      );
      assert.ok(
        find(findAll('tbody tr:nth-of-type(4) td')[2]).textContent.trim().endsWith(session4.title),
        'Title is visible.'
      );
      assert
        .dom(findAll('tbody tr:nth-of-type(4) td')[3])
        .hasText(sessionType4.title, 'Session type is visible.');
      assert.dom(findAll('tbody tr:nth-of-type(4) td')[4]).hasText('0', 'Total time is shown.');
      assert
        .dom(findAll('tbody tr:nth-of-type(4) td')[5])
        .hasText('0', 'Number of offerings is shown.');
    });

    test('empty list', async function (assert) {
      assert.expect(2);

      const block = this.server.create('curriculum-inventory-sequence-block');
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'title');
      this.set('setSortBy', function () {});
      await this.render(hbs`<CurriculumInventorySequenceBlockSessionList
      @sessions={{await sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);
      assert.dom('thead tr').exists({ count: 1 }, 'Table header is visible,');
      assert.dom('tbody tr').doesNotExist('but table body is empty.');
    });

    test('sort by title', async function (assert) {
      assert.expect(1);

      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType: this.server.create('session-type', { title: 'Lecture' }),
      });
      const block = this.server.create('curriculum-inventory-sequence-block', {
        sessions: [session],
      });
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'id');
      this.set('setSortBy', function (what) {
        assert.equal(what, 'title', 'Sorting callback gets called for session titles.');
      });
      await this.render(hbs`<CurriculumInventorySequenceBlockSessionList
      @sessions={{await sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);
      await click(findAll('thead th')[2]);
    });

    test('sort by session type', async function (assert) {
      assert.expect(1);
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType: this.server.create('session-type', { title: 'Lecture' }),
      });
      const block = this.server.create('curriculum-inventory-sequence-block', {
        sessions: [session],
      });
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'id');
      this.set('setSortBy', function (what) {
        assert.equal(
          what,
          'sessionType.title',
          'Sorting callback gets called for session type titles.'
        );
      });
      await this.render(hbs`<CurriculumInventorySequenceBlockSessionList
      @sessions={{sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);
      await click(findAll('thead th')[3]);
    });

    test('sort by offerings total', async function (assert) {
      assert.expect(1);
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType: this.server.create('session-type', { title: 'Lecture' }),
      });
      const block = this.server.create('curriculum-inventory-sequence-block', {
        sessions: [session],
      });
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'id');
      this.set('setSortBy', function (what) {
        assert.equal(
          what,
          'offerings.length',
          'Sorting callback gets called for offerings length.'
        );
      });
      await this.render(hbs`<CurriculumInventorySequenceBlockSessionList
      @sessions={{await sessions}}
      @sequenceBlock={{sequenceBlock}}
      @sortBy={{sortBy}}
      @setSortBy={{setSortBy}}
    />`);
      await click(findAll('thead th')[5]);
    });
  }
);
