import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('learnergroup-instructor-manager', 'Integration | Component | learnergroup instructor manager', {
  integration: true
});

test('it renders', function(assert) {
  const learnerGroup = EmberObject.create({
    title: 'this group',
    instructors: resolve([
      EmberObject.create({
        fullName: 'test person'
      })
    ]),
    instructorGroups: resolve([EmberObject.create({
      title: 'test group'
    })]),
  });

  this.set('nothing', parseInt);
  this.set('learnerGroup', learnerGroup);

  this.render(hbs`{{learnergroup-instructor-manager
    learnerGroup=learnerGroup
    save=(action nothing)
    close=(action nothing)
  }}`);

  assert.equal(this.$('li:eq(0)').text().trim(), 'test person |');
  assert.equal(this.$('li:eq(1)').text().trim(), 'test group |');
});

test('can remove groups', function(assert) {
  assert.expect(5);
  const group1 = 'li:eq(2)';
  const group2 = 'li:eq(3)';
  const saveButton = 'button.bigadd';
  const learnerGroup = EmberObject.create({
    title: 'this group',
    instructors: resolve([
      EmberObject.create({
        fullName: 'test person'
      }),
      EmberObject.create({
        fullName: 'test person 2'
      })
    ]),
    instructorGroups: resolve([
      EmberObject.create({
        id: 42,
        title: 'test group'
      }),
      EmberObject.create({
        id: 'beans',
        title: 'test group 2'
      }),
    ]),
  });

  this.set('nothing', parseInt);
  this.set('save', (users, groups) => {
    assert.equal(users.length, 2);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].get('title'), 'test group 2');
  });
  this.set('learnerGroup', learnerGroup);

  this.render(hbs`{{learnergroup-instructor-manager
    learnerGroup=learnerGroup
    save=(action save)
    close=(action nothing)
  }}`);

  assert.equal(this.$(group1).text().trim(), 'test group |');
  assert.equal(this.$(group2).text().trim(), 'test group 2 |');

  this.$(group1).click();

  return wait(this.$(saveButton).click());
});

test('can remove users', function(assert) {
  assert.expect(5);
  const user1 = 'li:eq(0)';
  const user2 = 'li:eq(1)';
  const saveButton = 'button.bigadd';
  const learnerGroup = EmberObject.create({
    title: 'this group',
    instructors: resolve([
      EmberObject.create({
        fullName: 'test person'
      }),
      EmberObject.create({
        fullName: 'test person 2'
      })
    ]),
    instructorGroups: resolve([
      EmberObject.create({
        id: 42,
        title: 'test group'
      }),
      EmberObject.create({
        id: 'beans',
        title: 'test group 2'
      }),
    ]),
  });

  this.set('nothing', parseInt);
  this.set('save', (users, groups) => {
    assert.equal(users.length, 1);
    assert.equal(users[0].get('fullName'), 'test person 2');
    assert.equal(groups.length, 2);
  });
  this.set('learnerGroup', learnerGroup);

  this.render(hbs`{{learnergroup-instructor-manager
    learnerGroup=learnerGroup
    save=(action save)
    close=(action nothing)
  }}`);

  assert.equal(this.$(user1).text().trim(), 'test person |');
  assert.equal(this.$(user2).text().trim(), 'test person 2 |');

  this.$(user1).click();

  return wait(this.$(saveButton).click());
});

test('it closes', function(assert) {
  assert.expect(1);
  this.set('nothing', parseInt);
  this.set('close', () => {
    assert.ok(true);
  });

  this.render(hbs`{{learnergroup-instructor-manager
    save=(action nothing)
    close=(action close)
  }}`);

  this.$('.bigcancel').click();
});
