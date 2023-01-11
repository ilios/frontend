import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { DateTime } from 'luxon';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-session-list';

module(
  'Integration | Component | curriculum-inventory/sequence-block-session-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);
    setupMirage(hooks);

    test('it renders', async function (assert) {
      const now = DateTime.now();
      const in15Hours = now.plus({ hours: 15 }).toJSDate();
      const in30Hours = now.plus({ hours: 30 }).toJSDate();

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
      const sessionType3 = this.server.create('session-type', { title: 'Small Groups' });
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
      this.server.create('session', {
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
        .findRecord('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'title');
      await render(hbs`<CurriculumInventory::SequenceBlockSessionList
      @sessions={{this.sessions}}
      @sequenceBlock={{this.sequenceBlock}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);
      assert.strictEqual(
        component.header.countAsOneOffering.text,
        'Count as one offering',
        'Column header is labeled correctly.'
      );
      assert.strictEqual(
        component.header.exclude.text,
        'Exclude',
        'Column header is labeled correctly.'
      );
      assert.strictEqual(
        component.header.title.text,
        'Session Title',
        'Column header is labeled correctly.'
      );
      assert.strictEqual(
        component.header.sessionType.text,
        'Session Type',
        'Column header is labeled correctly.'
      );
      assert.strictEqual(
        component.header.totalTime.text,
        'Total time',
        'Column header is labeled correctly.'
      );
      assert.strictEqual(
        component.header.offeringsCount.text,
        'Offerings',
        'Column header is labeled correctly.'
      );
      assert.strictEqual(
        component.sessions[0].countAsOneOffering.text,
        'Yes',
        'All offerings in session are counted as one.'
      );
      assert.strictEqual(component.sessions[0].exclude.text, 'No', 'Excluded value is shown.');
      assert.strictEqual(component.sessions[0].title.text, 'Aardvark', 'Session title is shown.');
      assert.strictEqual(
        component.sessions[0].sessionType.text,
        'Lecture',
        'Session type title is shown.'
      );
      assert.strictEqual(component.sessions[0].totalTime.text, '30.00', 'Total time is shown.');
      assert.strictEqual(
        component.sessions[0].offeringsCount.text,
        '2',
        'Number of offerings is shown.'
      );
      assert.strictEqual(
        component.sessions[1].countAsOneOffering.text,
        'No',
        'All offerings are counted individually.'
      );
      assert.strictEqual(component.sessions[1].exclude.text, 'Yes', 'Excluded value is shown.');
      assert.strictEqual(component.sessions[1].title.text, 'Bluebird', 'Session title is shown.');
      assert.strictEqual(
        component.sessions[1].sessionType.text,
        'Ceremony',
        'Session type title is shown.'
      );
      assert.strictEqual(component.sessions[1].totalTime.text, '15.00', 'Total time is shown.');
      assert.strictEqual(
        component.sessions[1].offeringsCount.text,
        '1',
        'Number of offerings is shown.'
      );
      assert.strictEqual(
        component.sessions[2].countAsOneOffering.text,
        'Yes',
        'All offerings in session are counted as one.'
      );
      assert.strictEqual(component.sessions[2].exclude.text, 'No', 'Excluded value is shown.');
      assert.strictEqual(component.sessions[2].title.text, 'Zeppelin', 'Session title is shown.');
      assert.strictEqual(
        component.sessions[2].sessionType.text,
        'Small Groups',
        'Session type title is shown.'
      );
      assert.strictEqual(component.sessions[2].totalTime.text, '0', 'Total time is shown.');
      assert.strictEqual(
        component.sessions[2].offeringsCount.text,
        '0',
        'Number of offerings is shown.'
      );
      assert.strictEqual(
        component.sessions[3].countAsOneOffering.text,
        'No',
        'All offerings in session are counted individually.'
      );
      assert.strictEqual(component.sessions[3].exclude.text, 'No', 'Excluded value is shown.');
      assert.strictEqual(
        component.sessions[3].title.text,
        '(ILM) Zwickzange',
        'Session title is shown and ILM is indicated.'
      );
      assert.strictEqual(
        component.sessions[3].sessionType.text,
        'Rocket Surgery',
        'Session type title is shown.'
      );
      assert.strictEqual(component.sessions[3].totalTime.text, '0', 'Total time is shown.');
      assert.strictEqual(
        component.sessions[3].offeringsCount.text,
        '0',
        'Number of offerings is shown.'
      );
    });

    test('empty list', async function (assert) {
      const block = this.server.create('curriculum-inventory-sequence-block');
      const blockModel = await this.owner
        .lookup('service:store')
        .findRecord('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'title');
      await render(hbs`<CurriculumInventory::SequenceBlockSessionList
      @sessions={{await this.sessions}}
      @sequenceBlock={{this.sequenceBlock}}
      @sortBy={{this.sortBy}}
      @setSortBy={{(noop)}}
    />`);
      assert.ok(component.header.exclude.isVisible, 'Table header is visible,');
      assert.strictEqual(component.sessions.length, 0, 'but table body is empty.');
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
        .findRecord('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'id');
      this.set('setSortBy', function (what) {
        assert.strictEqual(what, 'title', 'Sorting callback gets called for session titles.');
      });
      await render(hbs`<CurriculumInventory::SequenceBlockSessionList
      @sessions={{await this.sessions}}
      @sequenceBlock={{this.sequenceBlock}}
      @sortBy={{this.sortBy}}
      @setSortBy={{this.setSortBy}}
    />`);
      await component.header.title.click();
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
        .findRecord('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'id');
      this.set('setSortBy', function (what) {
        assert.strictEqual(
          what,
          'sessionType.title',
          'Sorting callback gets called for session type titles.'
        );
      });
      await render(hbs`<CurriculumInventory::SequenceBlockSessionList
        @sessions={{this.sessions}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{this.setSortBy}}
      />`);
      await component.header.sessionType.click();
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
        .findRecord('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'id');
      this.set('setSortBy', function (what) {
        assert.strictEqual(
          what,
          'offerings.length',
          'Sorting callback gets called for offerings length.'
        );
      });
      await render(hbs`<CurriculumInventory::SequenceBlockSessionList
      @sessions={{await this.sessions}}
      @sequenceBlock={{this.sequenceBlock}}
      @sortBy={{this.sortBy}}
      @setSortBy={{this.setSortBy}}
    />`);
      await component.header.offeringsCount.click();
    });
  }
);
