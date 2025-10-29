import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { DateTime } from 'luxon';
import { component } from 'frontend/tests/pages/components/curriculum-inventory/sequence-block-session-manager';
import SequenceBlockSessionManager from 'frontend/components/curriculum-inventory/sequence-block-session-manager';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module(
  'Integration | Component | curriculum-inventory/sequence-block-session-manager',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    test('it renders', async function (assert) {
      const now = DateTime.now();
      const in15Hours = now.plus({ hours: 15 }).toJSDate();
      const in30Hours = now.plus({ hours: 30 }).toJSDate();
      const offering1 = this.server.create('offering', {
        startDate: now.toJSDate(),
        endDate: in30Hours,
      });
      const offering2 = this.server.create('offering', {
        startDate: now.toJSDate(),
        endDate: in15Hours,
      });
      const offering3 = this.server.create('offering', {
        startDate: now.toJSDate(),
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
      const sessionModel1 = await this.owner
        .lookup('service:store')
        .findRecord('session', session1.id);
      const sessionModel2 = await this.owner
        .lookup('service:store')
        .findRecord('session', session2.id);
      const sessionModel3 = await this.owner
        .lookup('service:store')
        .findRecord('session', session3.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('linkedSessions', [sessionModel1, sessionModel3]);
      this.set('excludedSessions', [sessionModel2]);
      this.set('sortBy', 'title');
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{this.sessions}}
            @linkedSessions={{this.linkedSessions}}
            @excludedSessions={{this.excludedSessions}}
            @sortBy={{this.sortBy}}
            @setSortBy={{(noop)}}
            @save={{(noop)}}
            @cancel={{(noop)}}
          />
        </template>,
      );
      assert.strictEqual(
        component.header.countAsOneOffering.text,
        'Count as one offering',
        'Column header is labeled correctly.',
      );
      assert.strictEqual(
        component.header.exclude.text,
        'Exclude',
        'Column header is labeled correctly.',
      );
      assert.strictEqual(
        component.header.title.text,
        'Session Title',
        'Column header is labeled correctly.',
      );
      assert.strictEqual(
        component.header.sessionType.text,
        'Session Type',
        'Column header is labeled correctly.',
      );
      assert.strictEqual(
        component.header.totalTime.text,
        'Total time',
        'Column header is labeled correctly.',
      );
      assert.strictEqual(
        component.header.offeringsCount.text,
        'Offerings',
        'Column header is labeled correctly.',
      );
      assert.notOk(
        component.header.countAsOneOffering.isChecked,
        'Not all sessions have their offerings counted as one.',
      );
      assert.ok(
        component.header.countAsOneOffering.isPartiallyChecked,
        'Some sessions have their offerings counted as one.',
      );
      assert.notOk(component.header.exclude.isChecked, 'Not all sessions are excluded.');
      assert.ok(component.header.exclude.isPartiallyChecked, 'Some sessions are excluded.');
      assert.strictEqual(component.sessions.length, 4);
      assert.strictEqual(component.sessions[0].title.text, 'Aardvark', 'Session title is shown.');
      assert.strictEqual(
        component.sessions[0].sessionType.text,
        'Lecture',
        'Session type is shown.',
      );
      assert.strictEqual(component.sessions[0].totalTime.text, '30.00', 'Total time is shown.');
      assert.strictEqual(
        component.sessions[0].offeringsCount.text,
        '1',
        'Number of offerings is shown.',
      );
      assert.ok(
        component.sessions[0].countAsOneOffering.isChecked,
        'Session offerings are counted as one.',
      );
      assert.notOk(component.sessions[0].exclude.isChecked, 'Session is not excluded.');
      assert.strictEqual(component.sessions[1].title.text, 'Bluebird', 'Session title is shown.');
      assert.strictEqual(
        component.sessions[1].sessionType.text,
        'Ceremony',
        'Session type is shown.',
      );
      assert.strictEqual(component.sessions[1].totalTime.text, '30.00', 'Total time is shown.');
      assert.strictEqual(
        component.sessions[1].offeringsCount.text,
        '2',
        'Number of offerings is shown.',
      );
      assert.notOk(
        component.sessions[1].countAsOneOffering.isChecked,
        'Session offerings are not counted as one.',
      );
      assert.ok(component.sessions[1].exclude.isChecked, 'Session is excluded.');
      assert.strictEqual(component.sessions[2].title.text, 'Zeppelin', 'Session title is shown.');
      assert.strictEqual(
        component.sessions[2].sessionType.text,
        'Small Groups',
        'Session type is shown.',
      );
      assert.strictEqual(component.sessions[2].totalTime.text, '0', 'Total time is shown.');
      assert.strictEqual(
        component.sessions[2].offeringsCount.text,
        '0',
        'Number of offerings is shown.',
      );
      assert.ok(
        component.sessions[2].countAsOneOffering.isChecked,
        'Session offerings are counted as one.',
      );
      assert.notOk(component.sessions[2].exclude.isChecked, 'Session are not excluded.');
      assert.strictEqual(
        component.sessions[3].title.text,
        '(ILM) Zwickzange',
        'Session title is shown, ILM indicated as such.',
      );
      assert.strictEqual(
        component.sessions[3].sessionType.text,
        'Rocket Surgery',
        'Session type is shown.',
      );
      assert.strictEqual(component.sessions[3].totalTime.text, '0', 'Total time is shown.');
      assert.strictEqual(
        component.sessions[3].offeringsCount.text,
        '0',
        'Number of offerings is shown.',
      );
      assert.notOk(
        component.sessions[3].countAsOneOffering.isChecked,
        'Session offerings not counted as one.',
      );
      assert.notOk(component.sessions[3].exclude.isChecked, 'Session are not excluded.');
    });

    test('empty list', async function (assert) {
      this.set('sortBy', 'title');
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{(array)}}
            @linkedSessions={{(array)}}
            @excludedSessions={{(array)}}
            @sortBy={{this.sortBy}}
            @setSortBy={{(noop)}}
            @save={{(noop)}}
            @cancel={{(noop)}}
          />
        </template>,
      );
      assert.ok(component.header.isVisible);
      assert.strictEqual(component.sessions.length, 0);
    });

    test('sort by title', async function (assert) {
      const sessionType = this.server.create('session-type');
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType,
        maxDuration: 0,
      });
      const sessionModel = await this.owner
        .lookup('service:store')
        .findRecord('session', session.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('linkedSession', [sessionModel]);
      this.set('sortBy', 'id');
      this.set('setSortBy', function (what) {
        assert.step('setSortBy called');
        assert.strictEqual(what, 'title', 'Sorting callback gets called for session titles.');
      });
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{this.sessions}}
            @linkedSessions={{this.linkedSessions}}
            @excludedSessions={{(array)}}
            @sortBy={{this.sortBy}}
            @setSortBy={{this.setSortBy}}
            @save={{(noop)}}
            @cancel={{(noop)}}
          />
        </template>,
      );
      await component.header.title.click();
      assert.verifySteps(['setSortBy called']);
    });

    test('sort by session type', async function (assert) {
      const sessionType = this.server.create('session-type');
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType,
        maxDuration: 0,
      });
      const sessionModel = await this.owner
        .lookup('service:store')
        .findRecord('session', session.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('linkedSessions', [sessionModel]);
      this.set('sortBy', 'id');
      this.set('setSortBy', function (what) {
        assert.step('setSortBy called');
        assert.strictEqual(
          what,
          'sessionType.title',
          'Sorting callback gets called for session types.',
        );
      });
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{this.sessions}}
            @linkedSessions={{this.linkedSessions}}
            @excludedSessions={{(array)}}
            @sortBy={{this.sortBy}}
            @setSortBy={{this.setSortBy}}
            @save={{(noop)}}
            @cancel={{(noop)}}
          />
        </template>,
      );
      await component.header.sessionType.click();
      assert.verifySteps(['setSortBy called']);
    });

    test('sort by offerings count', async function (assert) {
      const sessionType = this.server.create('session-type');
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType,
        maxDuration: 0,
      });
      const sessionModel = await this.owner
        .lookup('service:store')
        .findRecord('session', session.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('linkedSessions', [sessionModel]);
      this.set('sortBy', 'id');
      this.set('setSortBy', function (what) {
        assert.step('setSortBy called');
        assert.strictEqual(
          what,
          'offerings.length',
          'Sorting callback gets called for offerings count.',
        );
      });
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{this.sessions}}
            @linkedSessions={{this.linkedSessions}}
            @excludedSessions={{(array)}}
            @sortBy={{this.sortBy}}
            @setSortBy={{this.setSortBy}}
            @save={{(noop)}}
            @cancel={{(noop)}}
          />
        </template>,
      );
      await component.header.offeringsCount.click();
      assert.verifySteps(['setSortBy called']);
    });

    test('change count as one offering', async function (assert) {
      const now = DateTime.now();
      const in15Hours = now.plus({ hours: 15 }).toJSDate();
      const in30Hours = now.plus({ hours: 30 }).toJSDate();
      const offering1 = this.server.create('offering', {
        startDate: now.toJSDate(),
        endDate: in30Hours,
      });
      const offering2 = this.server.create('offering', {
        startDate: now.toJSDate(),
        endDate: in15Hours,
      });
      const sessionType = this.server.create('session-type');
      const session = this.server.create('session', {
        title: 'Zeppelin',
        sessionType,
        offerings: [offering1, offering2],
      });
      const sessionModel = await this.owner
        .lookup('service:store')
        .findRecord('session', session.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('linkedSessions', [sessionModel]);
      this.set('sortBy', 'id');
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{this.sessions}}
            @linkedSessions={{this.linkedSessions}}
            @excludedSessions={{(array)}}
            @sortBy={{this.sortBy}}
            @setSortBy={{(noop)}}
            @save={{(noop)}}
            @cancel={{(noop)}}
          />
        </template>,
      );
      assert.strictEqual(component.sessions[0].totalTime.text, '30.00');
      assert.ok(component.header.countAsOneOffering.isChecked);
      assert.notOk(component.header.countAsOneOffering.isPartiallyChecked);
      assert.ok(component.sessions[0].countAsOneOffering.isChecked);
      await component.sessions[0].countAsOneOffering.toggle();
      assert.strictEqual(component.sessions[0].totalTime.text, '45.00');
      assert.notOk(component.header.countAsOneOffering.isChecked);
      assert.notOk(component.header.countAsOneOffering.isPartiallyChecked);
      assert.notOk(component.sessions[0].countAsOneOffering.isChecked);
    });

    test('check all/uncheck count offerings as one', async function (assert) {
      const now = DateTime.now();
      const in15Hours = now.plus({ hours: 15 }).toJSDate();
      const in30Hours = now.plus({ hours: 30 }).toJSDate();
      const offering1 = this.server.create('offering', {
        startDate: now.toJSDate(),
        endDate: in30Hours,
      });
      const offering2 = this.server.create('offering', {
        startDate: now.toJSDate(),
        endDate: in15Hours,
      });
      const offering3 = this.server.create('offering', {
        startDate: now.toJSDate(),
        endDate: in30Hours,
      });
      const offering4 = this.server.create('offering', {
        startDate: now.toJSDate(),
        endDate: in30Hours,
      });
      const sessionType = this.server.create('session-type');
      const session = this.server.create('session', {
        title: 'Alpha',
        sessionType: sessionType,
        offerings: [offering1, offering2],
      });
      this.server.create('session', {
        title: 'Omega',
        sessionType: sessionType,
        offerings: [offering3, offering4],
      });
      const sessionModel = await this.owner
        .lookup('service:store')
        .findRecord('session', session.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('linkedSessions', [sessionModel]);
      this.set('sortBy', 'id');
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{this.sessions}}
            @linkedSessions={{this.linkedSessions}}
            @excludedSessions={{(array)}}
            @sortBy={{this.sortBy}}
            @setSortBy={{(noop)}}
            @save={{(noop)}}
            @cancel={{(noop)}}
          />
        </template>,
      );
      assert.notOk(component.header.countAsOneOffering.isChecked);
      assert.ok(component.header.countAsOneOffering.isPartiallyChecked);
      assert.ok(component.sessions[0].countAsOneOffering.isChecked);
      assert.strictEqual(component.sessions[0].totalTime.text, '30.00');
      assert.notOk(component.sessions[1].countAsOneOffering.isChecked);
      assert.strictEqual(component.sessions[1].totalTime.text, '60.00');
      await component.header.countAsOneOffering.toggle();
      assert.ok(component.header.countAsOneOffering.isChecked);
      assert.notOk(component.header.countAsOneOffering.isPartiallyChecked);
      assert.ok(component.sessions[0].countAsOneOffering.isChecked);
      assert.strictEqual(component.sessions[0].totalTime.text, '30.00');
      assert.ok(component.sessions[1].countAsOneOffering.isChecked);
      assert.strictEqual(component.sessions[1].totalTime.text, '30.00');
      await component.header.countAsOneOffering.toggle();
      assert.notOk(component.header.countAsOneOffering.isChecked);
      assert.notOk(component.header.countAsOneOffering.isPartiallyChecked);
      assert.notOk(component.sessions[0].countAsOneOffering.isChecked);
      assert.strictEqual(component.sessions[0].totalTime.text, '45.00');
      assert.notOk(component.sessions[1].countAsOneOffering.isChecked);
      assert.strictEqual(component.sessions[1].totalTime.text, '60.00');
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
      const sessionModel1 = await this.owner
        .lookup('service:store')
        .findRecord('session', session1.id);
      const sessionModel2 = await this.owner
        .lookup('service:store')
        .findRecord('session', session2.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('linkedSessions', [sessionModel2]);
      this.set('excludedSessions', [sessionModel1]);
      this.set('sortBy', 'id');
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{this.sessions}}
            @linkedSessions={{this.linkedSessions}}
            @excludedSessions={{this.excludedSessions}}
            @sortBy={{this.sortBy}}
            @setSortBy={{(noop)}}
            @save={{(noop)}}
            @cancel={{(noop)}}
          />
        </template>,
      );
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
      const sessionType = this.server.create('session-type');
      const session1 = this.server.create('session', {
        title: 'Alpha',
        sessionType: sessionType,
      });
      const session2 = this.server.create('session', {
        title: 'Omega',
        sessionType: sessionType,
      });
      const sessionModel1 = await this.owner
        .lookup('service:store')
        .findRecord('session', session1.id);
      const sessionModel2 = await this.owner
        .lookup('service:store')
        .findRecord('session', session2.id);
      const sessionModels = await this.owner.lookup('service:store').findAll('session');
      this.set('sessions', sessionModels);
      this.set('linkedSessions', [sessionModel1]);
      this.set('excludedSessions', [sessionModel2]);
      this.set('sortBy', 'id');
      this.set('save', (countAsOneOfferingSessions, excludedSessions) => {
        assert.step('save called');
        assert.strictEqual(countAsOneOfferingSessions.length, 1);
        assert.strictEqual(countAsOneOfferingSessions[0].title, 'Omega');
        assert.strictEqual(excludedSessions.length, 1);
        assert.strictEqual(excludedSessions[0].title, 'Alpha');
      });
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{this.sessions}}
            @sequenceBlock={{this.sequenceBlock}}
            @linkedSessions={{this.linkedSessions}}
            @excludedSessions={{this.excludedSessions}}
            @sortBy={{this.sortBy}}
            @setSortBy={{(noop)}}
            @save={{this.save}}
            @cancel={{(noop)}}
          />
        </template>,
      );
      assert.ok(component.sessions[0].countAsOneOffering.isChecked);
      assert.notOk(component.sessions[0].exclude.isChecked);
      assert.notOk(component.sessions[1].countAsOneOffering.isChecked);
      assert.ok(component.sessions[1].exclude.isChecked);
      await component.sessions[0].countAsOneOffering.toggle();
      await component.sessions[0].exclude.toggle();
      await component.sessions[1].countAsOneOffering.toggle();
      await component.sessions[1].exclude.toggle();
      await component.save();
      assert.verifySteps(['save called']);
    });

    test('cancel', async function (assert) {
      this.set('sortBy', 'title');
      this.set('cancel', () => {
        assert.step('cancel called');
      });
      await render(
        <template>
          <SequenceBlockSessionManager
            @sessions={{(array)}}
            @linkedSessions={{(array)}}
            @excludedSessions={{(array)}}
            @sortBy={{this.sortBy}}
            @save={{(noop)}}
            @cancel={{this.cancel}}
          />
        </template>,
      );
      await component.cancel();
      assert.verifySteps(['cancel called']);
    });
  },
);
