import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

const { resolve } = RSVP;
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | my profile', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const user = EmberObject.create({
      fullName: 'test name',
      isStudent: true,
      school: resolve(EmberObject.create({title: 'test school'})),
      primaryCohort: resolve(EmberObject.create({title: 'test cohort'})),
      secondaryCohorts: resolve([
        EmberObject.create({title: 'second cohort'}),
        EmberObject.create({title: 'a third cohort'}),
      ]),
    });

    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`<MyProfile
      @user={{user}}
      @toggleShowCreateNewToken={{action nothing}}
      @toggleShowInvalidateTokens={{action nothing}}
    />`);

    assert.dom('.name').hasText('test name');
    assert.dom('.is-student').hasText('Student');

    assert.equal(find('[data-test-info] div').textContent.replace(/[\n]+/g, '').replace(/\s\s/g, '').trim(), 'Primary School:test school');
    assert.equal(findAll('[data-test-info] div')[1].textContent.replace(/[\n]+/g, '').replace(/\s\s/g, '').trim(), 'Primary Cohort:test cohort');
    assert.dom('[data-test-info] div:nth-of-type(3) li').hasText('a third cohort');
    assert.dom(findAll('[data-test-info] div:nth-of-type(3) li')[1]).hasText('second cohort');

  });

  test('it renders all no', async function(assert) {
    const user = EmberObject.create({
      fullName: 'test name',
      isStudent: false,
      roles: resolve([]),
      userSyncIgnore: false,
      school: resolve(),
      primaryCohort: resolve(),
      secondaryCohorts: resolve([]),
    });

    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`<MyProfile
      @user={{user}}
      @toggleShowCreateNewToken={{action nothing}}
      @toggleShowInvalidateTokens={{action nothing}}
    />`);

    assert.dom('.name').hasText('test name');
    assert.dom('.is-student').doesNotExist();

    assert.equal(findAll('[data-test-info] div')[0].textContent.replace(/[\n]+/g, '').replace(/\s\s/g, '').trim(), 'Primary School:Unassigned');
    assert.equal(findAll('[data-test-info] div')[1].textContent.replace(/[\n]+/g, '').replace(/\s\s/g, '').trim(), 'Primary Cohort:Unassigned');

    assert.equal(findAll('[data-test-info] div')[2].textContent.replace(/[\n]+/g, '').replace(/\s\s/g, '').trim(), 'Secondary Cohorts:Unassigned');
  });

  test('generates token when asked with good expiration date', async function(assert) {
    assert.expect(6);
    const go = '.bigadd:nth-of-type(1)';
    const newToken = '.new-token-result input';

    this.server.get(`/auth/token`, (scheme, { queryParams }) => {
      assert.ok('ttl' in queryParams);
      const duration = moment.duration(queryParams.ttl);
      assert.equal(duration.weeks(), 2);
      assert.ok(duration.hours() < 24);
      assert.ok(duration.minutes() < 60);
      assert.ok(duration.seconds() < 60);

      return {
        jwt: 'new token'
      };
    });
    this.set('nothing', parseInt);
    await render(hbs`<MyProfile
      @showCreateNewToken={{true}}
      @toggleShowCreateNewToken={{action nothing}}
      @toggleShowInvalidateTokens={{action nothing}}
    />`);

    await click(go);
    assert.equal(find(newToken).value.trim(), 'new token');
  });

  test('clear and reset from new token screen', async function(assert) {
    assert.expect(3);
    const cancel = '[data-test-result-reset]';
    const go = '[data-test-new-token-create]';
    const newToken = '.new-token-result input';
    const newTokenForm = '.new-token-form';

    this.server.get(`/auth/token`, () => {
      return {
        jwt: 'new token'
      };
    });

    this.set('toggle', () => {
      assert.ok(true);
    });
    await render(hbs`<MyProfile
      @showCreateNewToken={{true}}
      @toggleShowCreateNewToken={{action toggle}}
    />`);

    await click(go);

    assert.equal(find(newToken).value.trim(), 'new token');
    assert.dom(newTokenForm).doesNotExist();
    await click(cancel);
  });

  test('clicking button fires show token event', async function(assert) {
    const newTokenButton = '[data-test-show-create-new-token]';

    assert.expect(1);
    this.set('toggle', ()=> {
      assert.ok(true);
    });
    this.set('nothing', parseInt);
    await render(hbs`<MyProfile
      @toggleShowCreateNewToken={{action toggle}}
      @toggleShowInvalidateTokens={{action nothing}}
    />`);

    await click(newTokenButton);
  });

  test('Setting date changes request length', async function(assert) {
    assert.expect(5);
    const go = '.bigadd:nth-of-type(1)';
    const datePicker = '.new-token-form input:nth-of-type(1)';

    this.server.get(`/auth/token`, (scheme, { queryParams }) => {
      assert.ok('ttl' in queryParams);
      const duration = moment.duration(queryParams.ttl);
      assert.ok(duration.days() < 41);
      assert.ok(duration.hours() < 24);
      assert.ok(duration.minutes() < 60);
      assert.ok(duration.seconds() < 60);

      return {
        jwt: 'new token'
      };
    });
    this.set('nothing', () => {});
    await render(hbs`<MyProfile
      @showCreateNewToken={{true}}
      @toggleShowCreateNewToken={{action nothing}}
      @toggleShowInvalidateTokens={{action nothing}}
    />`);

    let m = moment().add(41, 'days');
    let interactor = openDatepicker(find(datePicker));
    interactor.selectDate(m.toDate());
    await click(go);
  });

  test('clicking button fires invalidate tokens event', async function(assert) {
    const invalidateTokensButton = 'button.invalidate-tokens';

    assert.expect(1);
    this.set('toggle', ()=> {
      assert.ok(true);
    });
    this.set('nothing', parseInt);
    await render(hbs`<MyProfile
      @toggleShowCreateNewToken={{action nothing}}
      @toggleShowInvalidateTokens={{action toggle}}
    />`);

    await click(invalidateTokensButton);
  });

  test('invalidate tokens when asked', async function(assert) {
    assert.expect(4);
    const go = '.done:nth-of-type(1)';

    this.server.get(`/auth/invalidatetokens`, () => {
      assert.ok(true, 'route is hit');
      return {
        jwt: 'new token'
      };
    });
    let sessionMock = Service.extend({
      authenticate(how, obj){
        assert.equal(how, 'authenticator:ilios-jwt');
        assert.ok(obj.jwt);
        assert.equal(obj.jwt, 'new token');
      }
    });
    this.owner.register('service:session', sessionMock);
    this.session = this.owner.lookup('service:session');
    this.flashMessages = this.owner.lookup('service:flashMessages');
    this.set('nothing', parseInt);
    await render(hbs`<MyProfile
      @showInvalidateTokens={{true}}
      @toggleShowCreateNewToken={{action nothing}}
      @toggleShowInvalidateTokens={{action nothing}}
    />`);

    await click(go);
  });
});
