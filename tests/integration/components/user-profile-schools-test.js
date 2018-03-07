import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

let user;
let storeMock;
let som = EmberObject.create({
  id: '1',
  title: 'SOM'
});
let sod = EmberObject.create({
  id: '2',
  title: 'SOD'
});
let sop = EmberObject.create({
  id: '3',
  title: 'SOP'
});

module('Integration | Component | user profile schools', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    storeMock = Service.extend({});
    let sodPermission = EmberObject.create({
      user,
      tableName: 'school',
      tableRowId: '2',
      canRead: true,
      canWrite: true
    });
    user = EmberObject.create({
      id: 13,
      enabled: true,
      userSyncIgnore: false,
      school: resolve(som),
      schools: resolve([sod]),
      permissions: resolve([sodPermission])
    });

    let currentUser = Service.extend({
      model: resolve(EmberObject.create({
        school: resolve(sod),
        schools: resolve([som, sod, sop])
      }))
    });
    this.owner.register('service:currentUser', currentUser);
    this.owner.register('service:store', storeMock);
  });

  test('it renders', async function(assert) {
    storeMock.reopen({
      findAll(){
        return resolve([som, sod, sop]);
      }
    });

    this.set('user', user);
    await render(hbs`{{user-profile-schools user=user}}`);
    const primarySchool = '.primary-school';
    const permissionRows = 'tbody tr';
    const firstRowPermissions = `${permissionRows}:eq(0)`;
    const firstRowCanRead = `${firstRowPermissions} i:eq(0)`;
    const firstRowCanWrite = `${firstRowPermissions} i:eq(1)`;
    const secondRowPermissions = `${permissionRows}:eq(1)`;
    const secondRowCanRead = `${secondRowPermissions} i:eq(0)`;
    const secondRowCanWrite = `${secondRowPermissions} i:eq(1)`;

    return settled().then(()=>{
      assert.equal(findAll(permissionRows).length, 2, 'there are only two permission rows');
      assert.equal(find(primarySchool).textContent.trim(), 'Primary School: SOM', 'primary school is correct');
      assert.ok(this.$(firstRowCanRead).hasClass('fa-check'), 'sod can read');
      assert.ok(this.$(firstRowCanWrite).hasClass('fa-check'), 'sod can write');
      assert.ok(this.$(secondRowCanRead).hasClass('fa-ban'), 'sop can not read');
      assert.ok(this.$(secondRowCanWrite).hasClass('fa-ban'), 'sop can not write');

    });
  });

  test('clicking manage sends the action', async function(assert) {
    assert.expect(1);
    storeMock.reopen({
      findAll(){
        return resolve([som, sod, sop]);
      }
    });
    this.set('user', user);
    this.set('click', (what) =>{
      assert.ok(what, 'recieved boolean true value');
    });
    await render(hbs`{{user-profile-schools user=user isManagable=true setIsManaging=(action click)}}`);
    const manage = 'button.manage';
    await click(manage);
  });

  test('can edit user school permissions', async function(assert) {
    assert.expect(16);

    storeMock.reopen({
      findAll(){
        return resolve([som, sod, sop]);
      },
      createRecord(what, {canRead, canWrite, tableName, tableRowId}){
        assert.equal(what, 'permission', 'we are creating a permissions object');
        switch(tableRowId){
        case '2':
          //SOD permissions
          assert.equal(canRead, true, 'can read sod');
          assert.equal(canWrite, false, 'can write sod');
          assert.equal(tableName, 'school', 'table name is school');
          assert.equal(tableRowId, 2, 'table row id is correct');
          break;
        case '3':
          //SOD permissions
          assert.equal(canRead, true, 'can read sop');
          assert.equal(canWrite, false, 'can write sop');
          assert.equal(tableName, 'school', 'table name is school');
          assert.equal(tableRowId, 3, 'table row id is correct');
          break;
        default:
          assert.ok(false, `${tableRowId} was unknown table row id`);
        }
      },
    });
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-schools isManaging=true user=user setIsManaging=(action nothing)}}`);

    const permissionRows = 'tbody tr';
    const firstRowPermissions = `${permissionRows}:eq(0)`;
    const firstRowCanRead = `${firstRowPermissions} input:eq(0)`;
    const firstRowCanWrite = `${firstRowPermissions} input:eq(1)`;
    const secondRowPermissions = `${permissionRows}:eq(1)`;
    const secondRowCanRead = `${secondRowPermissions} input:eq(0)`;
    const secondRowCanWrite = `${secondRowPermissions} input:eq(1)`;

    return settled().then(async () => {
      assert.equal(findAll(permissionRows).length, 2, 'correct number of rows');
      assert.ok(this.$(firstRowCanRead).is(':checked'), 'sod can read');
      assert.ok(this.$(firstRowCanWrite).is(':checked'), 'sod can write');
      assert.ok(this.$(firstRowCanRead).is(':disabled'), 'sod read is disabled');
      assert.ok(this.$(secondRowCanRead).not(':checked'), 'sop can not read');
      assert.ok(this.$(secondRowCanWrite).not(':checked'), 'sop can not write');

      this.$(firstRowCanWrite).click().change();
      this.$(secondRowCanRead).click().change();

      await click('.bigadd');

      return settled();
    });
  });

  test('clicking write selects read', async function(assert) {
    assert.expect(6);

    storeMock.reopen({
      findAll(){
        return resolve([som, sod, sop]);
      },
    });
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-schools isManaging=true user=user setIsManaging=(action nothing)}}`);

    const permissionRows = 'tbody tr';
    const secondRowPermissions = `${permissionRows}:eq(1)`;
    const secondRowCanRead = `${secondRowPermissions} input:eq(0)`;
    const secondRowCanWrite = `${secondRowPermissions} input:eq(1)`;

    await settled();
    assert.ok(this.$(secondRowCanRead).not(':checked'), 'sop can not read');
    assert.ok(this.$(secondRowCanWrite).not(':checked'), 'sop can not write');
    assert.ok(this.$(secondRowCanRead).not(':disabled'), 'sop read is not disabled');

    this.$(secondRowCanWrite).click().change();
    await settled();
    assert.ok(this.$(secondRowCanRead).is(':checked'), 'sop canRead');
    assert.ok(this.$(secondRowCanWrite).is(':checked'), 'sop canWrite');
    assert.ok(this.$(secondRowCanRead).is(':disabled'), 'sop read is disabled');
  });

  test('changing user modifies display #2389', async function(assert) {
    storeMock.reopen({
      findAll(){
        return resolve([som, sod, sop]);
      }
    });
    let user2 = EmberObject.create({
      id: 14,
      enabled: true,
      userSyncIgnore: false,
      school: resolve(sod),
      schools: resolve([]),
      permissions: resolve([])
    });

    this.set('user', user);
    await render(hbs`{{user-profile-schools user=user}}`);

    const primarySchool = '.primary-school';
    const permissionRows = 'tbody tr';
    const firstRowPermissions = `${permissionRows}:eq(0)`;
    const firstRowSchoolName = `${firstRowPermissions} td:eq(0)`;
    const firstRowCanRead = `${firstRowPermissions} i:eq(0)`;
    const firstRowCanWrite = `${firstRowPermissions} i:eq(1)`;
    const secondRowPermissions = `${permissionRows}:eq(1)`;
    const secondRowSchoolName = `${secondRowPermissions} td:eq(0)`;
    const secondRowCanRead = `${secondRowPermissions} i:eq(0)`;
    const secondRowCanWrite = `${secondRowPermissions} i:eq(1)`;

    await settled();
    assert.equal(findAll(permissionRows).length, 2, 'there are only two permission rows');
    assert.equal(find(primarySchool).textContent.trim(), 'Primary School: SOM', 'primary school is correct');
    assert.equal(this.$(firstRowSchoolName).text().trim(), 'SOD', 'correct first school');
    assert.ok(this.$(firstRowCanRead).hasClass('fa-check'), 'sod can read');
    assert.ok(this.$(firstRowCanWrite).hasClass('fa-check'), 'sod can write');
    assert.equal(this.$(secondRowSchoolName).text().trim(), 'SOP', 'correct second school');
    assert.ok(this.$(secondRowCanRead).hasClass('fa-ban'), 'sop can not read');
    assert.ok(this.$(secondRowCanWrite).hasClass('fa-ban'), 'sop can not write');

    this.set('user', user2);

    await settled();
    assert.equal(findAll(permissionRows).length, 2, 'there are only two permission rows');
    assert.equal(find(primarySchool).textContent.trim(), 'Primary School: SOD', 'primary school is correct');
    assert.equal(this.$(firstRowSchoolName).text().trim(), 'SOM', 'correct first school');
    assert.ok(this.$(firstRowCanRead).hasClass('fa-ban'), 'sod can read');
    assert.ok(this.$(firstRowCanWrite).hasClass('fa-ban'), 'sod can write');
    assert.equal(this.$(secondRowSchoolName).text().trim(), 'SOP', 'correct second school');
    assert.ok(this.$(secondRowCanRead).hasClass('fa-ban'), 'sop can not read');
    assert.ok(this.$(secondRowCanWrite).hasClass('fa-ban'), 'sop can not write');
  });
});
