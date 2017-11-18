import { moduleFor, test } from 'ember-qunit';

moduleFor('service:current-user', 'CurrentUserService', {
  integration: true,
  beforeEach() {
    this.inject.service('session', { as: 'session' });
    this.inject.service('store', { as: 'store' });
  }
});

test('currentUserId', function(assert) {
  this.session.reopen({
    data: {
      authenticated: {
        jwt: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1MTA5Njg4NDEsImV4cCI6MTUxMDk3MjQ3NiwidXNlcl9pZCI6MTAwLCJqdGkiOiI5YzYxZDdjZS1jZjliLTQxZDgtYjQ5YS0zMWFmNWQ4Y2MzY2UifQ.P1QY8zDSi8IAVaJ0YHX_KzYsIfZP_bvBdocZ9V9JUb0"
      }
    }
  });
  const subject = this.subject();
  const userId = subject.get('currentUserId');
  assert.equal(userId, 100);
});

test('no token - no currentUserId', function(assert) {
  assert.expect(1);
  const subject = this.subject();
  const userId = subject.get('currentUserId');
  assert.equal(userId, null);
});


test('model', async function(assert) {
  assert.expect(3);

  const user = {};

  this.store.reopen({
    async find(what, id) {
      assert.equal(what, 'user');
      assert.equal(id, 100);
      return user;
    }
  });
  this.session.reopen({
    data: {
      authenticated: {
        jwt: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1MTA5Njg4NDEsImV4cCI6MTUxMDk3MjQ3NiwidXNlcl9pZCI6MTAwLCJqdGkiOiI5YzYxZDdjZS1jZjliLTQxZDgtYjQ5YS0zMWFmNWQ4Y2MzY2UifQ.P1QY8zDSi8IAVaJ0YHX_KzYsIfZP_bvBdocZ9V9JUb0"
      }
    }
  });
  const subject = this.subject();
  const model = await subject.get('model');
  assert.equal(model, user);
});

test('no token - no model', async function(assert) {
  assert.expect(1);
  const subject = this.subject();
  const model = await subject.get('model');
  assert.equal(model, null);
});
