import Service from '@ember/service';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | new user', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.schools = this.server.createList('school', 3);
    this.server.create('user', {
      school: this.schools[0],
    });
    const user = await run(() => this.owner.lookup('service:store').find('user', 1));

    this.currentUserMock = Service.extend({
      model: resolve(user),
      async canCreateUser() {
        return resolve(true);
      }
    });

    this.permissionCheckerMock = Service.extend({
      async canCreateUser() {
        return resolve(true);
      }
    });
    this.owner.register('service:current-user', this.currentUserMock);
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
  });


  test('it renders', async function (assert) {
    this.set('close', () => {});

    await render(hbs`{{new-user close=(action close)}}`);

    let content = this.element.textContent.trim();
    assert.ok(content.includes('New User'));
    assert.ok(content.includes('First Name'));
    assert.ok(content.includes('Last Name'));
    assert.ok(content.includes('Middle Name'));
    assert.ok(content.includes('Campus ID'));
    assert.ok(content.includes('Other ID'));
    assert.ok(content.includes('Email'));
    assert.ok(content.includes('Phone'));
    assert.ok(content.includes('Username'));
    assert.ok(content.includes('Password'));
    assert.ok(content.includes('Primary School'));

    const schools = 'select:nth-of-type(1) option';
    let options = findAll(schools);
    assert.equal(options.length, 3);
    assert.dom(options[0]).hasText('school 0');
    assert.dom(options[1]).hasText('school 1');
    assert.dom(options[2]).hasText('school 2');
  });

  test('errors do not show up initially', async function(assert) {
    this.set('close', () => {
      assert.ok(false); //shouldn't be called
    });
    await render(hbs`{{new-user close=(action close)}}`);
    assert.dom('.message').doesNotExist();
  });

  test('errors show up', async function(assert) {
    this.set('close', () => {
      assert.ok(false); //shouldn't be called
    });
    await render(hbs`{{new-user close=(action close)}}`);

    await click('.done');
    assert.dom('.message').exists({ count: 5 });
    let boxes = findAll('.item');
    assert.ok(boxes[0].textContent.includes('blank'));
    assert.ok(boxes[2].textContent.includes('blank'));
    assert.ok(boxes[5].textContent.includes('blank'));
    assert.ok(boxes[7].textContent.includes('blank'));
    assert.ok(boxes[8].textContent.includes('blank'));
  });

  test('create new user', async function(assert) {
    assert.expect(11);
    let studentRole = this.server.create('user-role', {
      id: 4,
      title: 'Student'
    });

    this.set('nothing', () => {});
    this.set('transitionToUser', (userId)=>{
      assert.equal(userId, 2);
    });
    await render(hbs`{{new-user close=(action nothing) transitionToUser=(action transitionToUser)}}`);
    const firstName = '[data-test-first-name] input';
    const middleName = '[data-test-middle-name] input';
    const lastName = '[data-test-last-name] input';
    const campusId = '[data-test-campus-id] input';
    const otherId = '[data-test-other-id] input';
    const email = '[data-test-email] input';
    const phone = '[data-test-phone] input';
    const username = '[data-test-username] input';
    const password = '[data-test-password] input';

    await fillIn(firstName, 'first');
    await fillIn(middleName, 'middle');
    await fillIn(lastName, 'last');
    await fillIn(campusId, 'campusid');
    await fillIn(otherId, 'otherid');
    await fillIn(phone, 'phone');
    await fillIn(email, 'test@test.com');
    await fillIn(username, 'user123');
    await fillIn(password, 'password123');
    await click('.done');

    const newUser = await run(() => this.owner.lookup('service:store').find('user', 2));
    assert.equal(newUser.firstName, 'first', 'with the correct firstName');
    assert.equal(newUser.middleName, 'middle', 'with the correct middleName');
    assert.equal(newUser.lastName, 'last', 'with the correct lastName');
    assert.equal(newUser.campusId, 'campusid', 'with the correct campusId');
    assert.equal(newUser.otherId, 'otherid', 'with the correct otherId');
    assert.equal(newUser.phone, 'phone', 'with the correct phone');
    assert.equal(newUser.email, 'test@test.com', 'with the correct email');
    const roles = await newUser.get('roles');
    assert.notOk(roles.mapBy('id').includes(studentRole.id));

    const authentication = await newUser.get('authentication');
    assert.equal(authentication.username, 'user123', 'with the correct username');
    assert.equal(authentication.password, 'password123', 'with the correct password');
  });

  test('create new student user', async function(assert) {
    assert.expect(12);
    let studentRole = this.server.create('user-role', {
      id: 4,
      title: 'Student'
    });
    const program = this.server.create('program', { school: this.schools[0] });
    const programYear = this.server.create('programYear', {
      program,
      startYear: new Date().getFullYear()
    });
    const cohort = this.server.create('cohort', { programYear });

    this.set('nothing', () => {});
    this.set('transitionToUser', (userId)=>{
      assert.equal(userId, 2);
    });
    await render(hbs`{{new-user close=(action nothing) transitionToUser=(action transitionToUser)}}`);
    const student = '[data-test-user-type] [data-test-second-button]';
    const firstName = '[data-test-first-name] input';
    const middleName = '[data-test-middle-name] input';
    const lastName = '[data-test-last-name] input';
    const campusId = '[data-test-campus-id] input';
    const otherId = '[data-test-other-id] input';
    const email = '[data-test-email] input';
    const phone = '[data-test-phone] input';
    const username = '[data-test-username] input';
    const password = '[data-test-password] input';

    await click(student);
    await fillIn(firstName, 'first');
    await fillIn(middleName, 'middle');
    await fillIn(lastName, 'last');
    await fillIn(campusId, 'campusid');
    await fillIn(otherId, 'otherid');
    await fillIn(phone, 'phone');
    await fillIn(email, 'test@test.com');
    await fillIn(username, 'user123');
    await fillIn(password, 'password123');

    await click('.done');

    const newUser = await run(() => this.owner.lookup('service:store').find('user', 2));
    assert.equal(newUser.firstName, 'first', 'with the correct firstName');
    assert.equal(newUser.middleName, 'middle', 'with the correct middleName');
    assert.equal(newUser.lastName, 'last', 'with the correct lastName');
    assert.equal(newUser.campusId, 'campusid', 'with the correct campusId');
    assert.equal(newUser.otherId, 'otherid', 'with the correct otherId');
    assert.equal(newUser.phone, 'phone', 'with the correct phone');
    assert.equal(newUser.email, 'test@test.com', 'with the correct email');
    const roles = await newUser.get('roles');
    assert.ok(roles.mapBy('id').includes(studentRole.id));
    const primaryCohort = await newUser.get('primaryCohort');
    assert.equal(primaryCohort.id, cohort.id);

    const authentication = await newUser.get('authentication');
    assert.equal(authentication.username, 'user123', 'with the correct username');
    assert.equal(authentication.password, 'password123', 'with the correct password');
  });
});
