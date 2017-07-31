import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('course-director-manager', 'Integration | Component | course director manager', {
  integration: true
});

test('it renders', function(assert) {
  const fakeUser1 = EmberObject.create({fullName: 'test person 1'});
  const fakeUser2 = EmberObject.create({fullName: 'test person 2'});

  this.set('nothing', parseInt);
  this.set('users', [fakeUser1, fakeUser2]);

  this.render(hbs`{{course-director-manager
    directors=users
    save=(action nothing)
    close=(action nothing)
  }}`);

  assert.equal(this.$('li:eq(0)').text().trim(), 'test person 1');
  assert.equal(this.$('li:eq(1)').text().trim(), 'test person 2');
});

test('can remove users', function(assert) {
  assert.expect(4);
  const fakeUser1 = EmberObject.create({fullName: 'test person 1'});
  const fakeUser2 = EmberObject.create({fullName: 'test person 2'});

  const user1 = 'li:eq(0)';
  const user2 = 'li:eq(1)';
  const saveButton = 'button.bigadd';

  this.set('nothing', parseInt);
  this.set('save', (users) => {
    assert.equal(users.length, 1);
    assert.equal(users[0].get('fullName'), 'test person 2');
  });
  this.set('users', [fakeUser1, fakeUser2]);

  this.render(hbs`{{course-director-manager
    directors=users
    save=(action save)
    close=(action nothing)
  }}`);

  assert.equal(this.$(user1).text().trim(), 'test person 1');
  assert.equal(this.$(user2).text().trim(), 'test person 2');

  this.$(user1).click();

  return wait(this.$(saveButton).click());
});

test('it closes', function(assert) {
  assert.expect(1);
  this.set('nothing', parseInt);
  this.set('close', () => {
    assert.ok(true);
  });

  this.render(hbs`{{course-director-manager
    save=(action nothing)
    close=(action close)
  }}`);

  this.$('.bigcancel').click();
});
