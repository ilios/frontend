import { setupRenderingTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import moment from 'moment';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-session-manager';

module(
  'Integration | Component | curriculum-inventory/sequence-block-session-manager',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    test('it renders', async function (assert) {
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
      const sessionType3 = this.server.create('session-type', { title: 'Small Groups' });
      const sessionType4 = this.server.create('session-type', { title: 'Rocket Surgery' });
      const session1 = this.server.create('session', {
        title: 'Aardvark',
        offerings: [offering1],
        sessionType: sessionType1,
      });
      const session2 = this.server.create('session', {
        title: 'Bluebird',
        offerings: [offering2, offering3],
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
        .find('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');

      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'title');
      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{this.sessions}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{(noop)}}
      />`);

      assert.equal(
        component.header.countAsOneOffering.text,
        'Count as one offering',
        'Column header is labeled correctly.'
      );
      assert.equal(component.header.exclude.text, 'Exclude', 'Column header is labeled correctly.');
      assert.equal(
        component.header.title.text,
        'Session Title',
        'Column header is labeled correctly.'
      );
      assert.equal(
        component.header.sessionType.text,
        'Session Type',
        'Column header is labeled correctly.'
      );
      assert.equal(
        component.header.totalTime.text,
        'Total time',
        'Column header is labeled correctly.'
      );
      assert.equal(
        component.header.offeringsCount.text,
        'Offerings',
        'Column header is labeled correctly.'
      );
      assert.notOk(
        component.header.countAsOneOffering.isChecked,
        'Not all sessions have their offerings counted as one.'
      );
      assert.ok(
        component.header.countAsOneOffering.isPartiallyChecked,
        'Some sessions have their offerings counted as one.'
      );
      assert.notOk(component.header.exclude.isChecked, 'Not all sessions are excluded.');
      assert.ok(component.header.exclude.isPartiallyChecked, 'Some sessions are excluded.');
      assert.equal(component.sessions.length, 4);
      assert.equal(component.sessions[0].title.text, 'Aardvark', 'Session title is shown.');
      assert.equal(component.sessions[0].sessionType.text, 'Lecture', 'Session type is shown.');
      assert.equal(component.sessions[0].totalTime.text, '30.00', 'Total time is shown.');
      assert.equal(component.sessions[0].offeringsCount.text, '1', 'Number of offerings is shown.');
      assert.ok(
        component.sessions[0].countAsOneOffering.isChecked,
        'Session offerings are counted as one.'
      );
      assert.notOk(component.sessions[0].exclude.isChecked, 'Session is not excluded.');
      assert.equal(component.sessions[1].title.text, 'Bluebird', 'Session title is shown.');
      assert.equal(component.sessions[1].sessionType.text, 'Ceremony', 'Session type is shown.');
      assert.equal(component.sessions[1].totalTime.text, '30.00', 'Total time is shown.');
      assert.equal(component.sessions[1].offeringsCount.text, '2', 'Number of offerings is shown.');
      assert.notOk(
        component.sessions[1].countAsOneOffering.isChecked,
        'Session offerings are not counted as one.'
      );
      assert.ok(component.sessions[1].exclude.isChecked, 'Session is excluded.');
      assert.equal(component.sessions[2].title.text, 'Zeppelin', 'Session title is shown.');
      assert.equal(
        component.sessions[2].sessionType.text,
        'Small Groups',
        'Session type is shown.'
      );
      assert.equal(component.sessions[2].totalTime.text, '0', 'Total time is shown.');
      assert.equal(component.sessions[2].offeringsCount.text, '0', 'Number of offerings is shown.');
      assert.ok(
        component.sessions[2].countAsOneOffering.isChecked,
        'Session offerings are counted as one.'
      );
      assert.notOk(component.sessions[2].exclude.isChecked, 'Session are not excluded.');
      assert.equal(
        component.sessions[3].title.text,
        '(ILM) Zwickzange',
        'Session title is shown, ILM indicated as such.'
      );
      assert.equal(
        component.sessions[3].sessionType.text,
        'Rocket Surgery',
        'Session type is shown.'
      );
      assert.equal(component.sessions[3].totalTime.text, '0', 'Total time is shown.');
      assert.equal(component.sessions[3].offeringsCount.text, '0', 'Number of offerings is shown.');
      assert.notOk(
        component.sessions[3].countAsOneOffering.isChecked,
        'Session offerings not counted as one.'
      );
      assert.notOk(component.sessions[3].exclude.isChecked, 'Session are not excluded.');
    });

    test('empty list', async function (assert) {
      const block = this.server.create('curriculum-inventory-sequence-block');
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'title');

      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{(array)}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{(noop)}}
      />`);

      assert.ok(component.header.isVisible);
      assert.equal(component.sessions.length, 0);
    });

    test('sort by title', async function (assert) {
      assert.expect(1);
      const sessionType = this.server.create('session-type');
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType,
        maxDuration: 0,
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

      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{this.sessions}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{this.setSortBy}}
      />`);

      await component.header.title.click();
    });

    test('sort by session type', async function (assert) {
      assert.expect(1);
      const sessionType = this.server.create('session-type');
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType,
        maxDuration: 0,
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
        assert.equal(what, 'sessionType.title', 'Sorting callback gets called for session types.');
      });

      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{this.sessions}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{this.setSortBy}}
      />`);

      await component.header.sessionType.click();
    });

    test('sort by offerings count', async function (assert) {
      assert.expect(1);
      const sessionType = this.server.create('session-type');
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType,
        maxDuration: 0,
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
        assert.equal(what, 'offerings.length', 'Sorting callback gets called for offerings count.');
      });

      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{this.sessions}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{this.setSortBy}}
      />`);

      await component.header.offeringsCount.click();
    });

    test('change count as one offering', async function (assert) {
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
      const sessionType = this.server.create('session-type');
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType,
        offerings: [offering1, offering2],
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

      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{this.sessions}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{(noop)}}
      />`);

      assert.equal(component.sessions[0].totalTime.text, '30.00');
      assert.ok(component.header.countAsOneOffering.isChecked);
      assert.notOk(component.header.countAsOneOffering.isPartiallyChecked);
      assert.ok(component.sessions[0].countAsOneOffering.isChecked);
      await component.sessions[0].countAsOneOffering.toggle();
      assert.equal(component.sessions[0].totalTime.text, '45.00');
      assert.notOk(component.header.countAsOneOffering.isChecked);
      assert.notOk(component.header.countAsOneOffering.isPartiallyChecked);
      assert.notOk(component.sessions[0].countAsOneOffering.isChecked);
    });

    test('check all/uncheck count offerings as one', async function (assert) {
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
        endDate: in30Hours,
      });
      const offering4 = this.server.create('offering', {
        startDate: now,
        endDate: in30Hours,
      });
      const sessionType = this.server.create('session-type');
      const session1 = this.server.create('session', {
        title: 'Alpha',
        sessionType: sessionType,
        offerings: [offering1, offering2],
      });
      this.server.create('session', {
        title: 'Omega',
        sessionType: sessionType,
        offerings: [offering3, offering4],
      });
      const block = this.server.create('curriculum-inventory-sequence-block', {
        sessions: [session1],
      });
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'id');

      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{this.sessions}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{(noop)}}
      />`);

      assert.notOk(component.header.countAsOneOffering.isChecked);
      assert.ok(component.header.countAsOneOffering.isPartiallyChecked);
      assert.ok(component.sessions[0].countAsOneOffering.isChecked);
      assert.equal(component.sessions[0].totalTime.text, '30.00');
      assert.notOk(component.sessions[1].countAsOneOffering.isChecked);
      assert.equal(component.sessions[1].totalTime.text, '60.00');
      await component.header.countAsOneOffering.toggle();
      assert.ok(component.header.countAsOneOffering.isChecked);
      assert.notOk(component.header.countAsOneOffering.isPartiallyChecked);
      assert.ok(component.sessions[0].countAsOneOffering.isChecked);
      assert.equal(component.sessions[0].totalTime.text, '30.00');
      assert.ok(component.sessions[1].countAsOneOffering.isChecked);
      assert.equal(component.sessions[1].totalTime.text, '30.00');
      await component.header.countAsOneOffering.toggle();
      assert.notOk(component.header.countAsOneOffering.isChecked);
      assert.notOk(component.header.countAsOneOffering.isPartiallyChecked);
      assert.notOk(component.sessions[0].countAsOneOffering.isChecked);
      assert.equal(component.sessions[0].totalTime.text, '45.00');
      assert.notOk(component.sessions[1].countAsOneOffering.isChecked);
      assert.equal(component.sessions[1].totalTime.text, '60.00');
    });

    test('check all/uncheck all excluded', async function (assert) {
      const sessionType = this.server.create('session-type');
      const session1 = this.server.create('session', {
        title: 'Alpha',
        sessionType: sessionType,
      });
      const session2 = this.server.create('session', {
        title: 'Omega',
        sessionType: sessionType,
      });
      const block = this.server.create('curriculum-inventory-sequence-block', {
        excludedSessions: [session1],
        sessions: [session2],
      });
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'id');

      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{this.sessions}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{(noop)}}
        @save={{this.save}}
      />`);

      assert.notOk(component.header.exclude.isChecked);
      assert.ok(component.header.exclude.isPartiallyChecked);
      assert.ok(component.sessions[0].exclude.isChecked);
      assert.notOk(component.sessions[1].exclude.isChecked);
      await component.header.exclude.toggle();
      assert.ok(component.header.exclude.isChecked);
      assert.notOk(component.header.exclude.isPartiallyChecked);
      assert.ok(component.sessions[0].exclude.isChecked);
      assert.ok(component.sessions[1].exclude.isChecked);
      await component.header.exclude.toggle();
      assert.notOk(component.header.exclude.isChecked);
      assert.notOk(component.header.exclude.isPartiallyChecked);
      assert.notOk(component.sessions[0].exclude.isChecked);
      assert.notOk(component.sessions[1].exclude.isChecked);
    });

    test('save', async function (assert) {
      assert.expect(8);
      const sessionType = this.server.create('session-type');
      const session1 = this.server.create('session', {
        title: 'Alpha',
        sessionType: sessionType,
      });
      const session2 = this.server.create('session', {
        title: 'Omega',
        sessionType: sessionType,
      });
      const block = this.server.create('curriculum-inventory-sequence-block', {
        sessions: [session1],
        excludedSessions: [session2],
      });
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'id');
      this.set('save', (countAsOneOfferingSessions, excludedSessions) => {
        assert.equal(countAsOneOfferingSessions.length, 1);
        assert.equal(countAsOneOfferingSessions[0].title, 'Omega');
        assert.equal(excludedSessions.length, 1);
        assert.equal(excludedSessions[0].title, 'Alpha');
      });

      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{this.sessions}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @setSortBy={{(noop)}}
        @save={{this.save}}
      />`);

      assert.ok(component.sessions[0].countAsOneOffering.isChecked);
      assert.notOk(component.sessions[0].exclude.isChecked);
      assert.notOk(component.sessions[1].countAsOneOffering.isChecked);
      assert.ok(component.sessions[1].exclude.isChecked);
      await component.sessions[0].countAsOneOffering.toggle();
      await component.sessions[0].exclude.toggle();
      await component.sessions[1].countAsOneOffering.toggle();
      await component.sessions[1].exclude.toggle();
      await component.save();
    });

    test('cancel', async function (assert) {
      assert.expect(1);
      const block = this.server.create('curriculum-inventory-sequence-block');
      const blockModel = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-sequence-block', block.id);

      this.set('sequenceBlock', blockModel);
      this.set('sortBy', 'title');
      this.set('cancel', () => {
        assert.ok(true, 'Cancel action fired.');
      });

      await render(hbs`<CurriculumInventory::SequenceBlockSessionManager
        @sessions={{(array)}}
        @sequenceBlock={{this.sequenceBlock}}
        @sortBy={{this.sortBy}}
        @cancel={{this.cancel}}
      />`);

      await component.cancel();
    });
  }
);
