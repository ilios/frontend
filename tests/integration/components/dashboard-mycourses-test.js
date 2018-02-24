import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/load-common-translations";

const { resolve } = RSVP;

let mockCourses = [
  EmberObject.create({
    title: 'first',
    level: 4,
    academicYear: '2012-2013',
    locked: false,
    archived: false,
    externalId: 'ABC123'
  }),
  EmberObject.create({
    title: 'second',
    level: 1,
    academicYear: '2013-2014',
    locked: false,
    archived: false,
    externalId: null
  }),
  EmberObject.create({
    title: 'third',
    level: 1,
    academicYear: '2012-2013',
    locked: false,
    archived: false,
    externalId: null

  }),
];

let currentUserMock = Service.extend({
  activeRelatedCoursesInThisYearAndLastYear: resolve(mockCourses),
  userIsFaculty: resolve(false),
  userIsCourseDirector: resolve(false),
  userIsDeveloper: resolve(true),
});

let currentUserMockNoCourses = Service.extend({
  activeRelatedCoursesInThisYearAndLastYear: resolve([]),
  userIsFaculty: resolve(true),
  userIsCourseDirector: resolve(false),
  userIsDeveloper: resolve(false),
});

let currentUserMockUnprivileged = Service.extend({
  activeRelatedCoursesInThisYearAndLastYear: resolve(mockCourses),
  userIsFaculty: resolve(false),
  userIsCourseDirector: resolve(false),
  userIsDeveloper: resolve(false),
});

module('Integration | Component | dashboard mycourses', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      initializer.initialize(this.owner);
    };
  });

  test('list courses for privileged users', async function(assert) {
    assert.expect(9);
    this.owner.register('service:currentUser', currentUserMock);
    await render(hbs`{{dashboard-mycourses}}`);
    const header = '.dashboard-block-header';

    await settled();
    assert.equal(this.$(header).text().trim(), 'My Courses');
    for(let i = 0; i < 2; i++){
      let a = this.$(`table a:eq(${i})`);
      assert.equal(a.length, 1);
      let links = this.$(`table tr:eq(${i}) td`);
      assert.equal(links.eq(0).text().trim(), mockCourses[i].academicYear);
      assert.ok(links.eq(1).text().trim().startsWith(mockCourses[i].title));
    }
    assert.ok(this.$('table tr:eq(0) td:eq(1)').text().trim().endsWith('(' + mockCourses[0].externalId + ')'));
    assert.equal(this.$(`table tr`).length, 3);

  });


  test('list courses for un-privileged users', async function(assert) {
    assert.expect(11);
    this.owner.register('service:currentUser', currentUserMockUnprivileged);
    await render(hbs`{{dashboard-mycourses}}`);
    assert.equal(this.$('.dashboard-block-header').text().trim(), 'My Courses');

    run.later(()=> {
      for(let i = 0; i < 3; i++){
        let a = this.$(`table a:eq(${i})`);
        assert.equal(a.length, 0);
        let tds = this.$(`table tr:eq(${i}) td`);
        assert.equal(tds.eq(0).text().trim(), mockCourses[i].academicYear);
        assert.equal(tds.eq(1).text().trim(), mockCourses[i].title);
      }

      assert.equal(this.$(`table tr`).length, 3);
    });

  });

  test('display none when no courses', async function(assert) {
    assert.expect(2);
    this.owner.register('service:currentUser', currentUserMockNoCourses);
    await render(hbs`{{dashboard-mycourses}}`);
    assert.equal(this.$('.dashboard-block-header').text().trim(), 'My Courses');

    assert.equal(this.$('.dashboard-block-body').text().trim(), 'None');

  });
});