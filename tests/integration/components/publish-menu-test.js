import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | publish menu', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let testObj = EmberObject.create({
      allPublicationIssuesLength: 3
    });
    this.set('testObj', testObj);
    this.set('nothing', parseInt);
    await render(hbs`{{publish-menu
      title='title'
      showAsIs=true
      showPublish=true
      showReview=true
      showTbd=true
      showUnPublish=true
      publishTranslation='general.publishCourse'
      unPublishTranslation='general.unPublishCourse'
      reviewRoute='course.publicationCheck'
      reviewObject=testObj
      publish=(action nothing)
      publishAsTbd=(action nothing)
      unpublish=(action nothing)
    }}`);
    const toggle = '.rl-dropdown-toggle';
    const icon = `${toggle} i`;
    const dropDownItems = '.rl-dropdown button';
    const asIs = `${dropDownItems}:eq(0)`;
    const publish = `${dropDownItems}:eq(1)`;
    const review = `${dropDownItems}:eq(2)`;
    const schedule = `${dropDownItems}:eq(3)`;
    const unpublish = `${dropDownItems}:eq(4)`;


    assert.equal(this.$(toggle).text().trim(), 'title');
    assert.ok(this.$(icon).hasClass('fa-cloud'));

    this.$(toggle).click();
    assert.equal(this.$(dropDownItems).length, 5);
    assert.equal(this.$(asIs).text().trim(), 'Publish As-is');
    assert.equal(this.$(publish).text().trim(), 'Publish Course');
    assert.equal(this.$(review).text().trim(), 'Review 3 Missing Items');
    assert.equal(this.$(schedule).text().trim(), 'Mark as Scheduled');
    assert.equal(this.$(unpublish).text().trim(), 'UnPublish Course');
  });

  test('as is action fires', async function(assert) {
    assert.expect(2);
    this.set('click', ()=>{
      assert.ok(true, 'action fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`{{publish-menu
      showAsIs=true
      publish=(action click)
      publishAsTbd=(action nothing)
      unpublish=(action nothing)
    }}`);
    const toggle = '.rl-dropdown-toggle';
    const dropDownItems = '.rl-dropdown button';
    const item = `${dropDownItems}:eq(0)`;

    this.$(toggle).click();
    assert.equal(this.$(item).text().trim(), 'Publish As-is');
    this.$(item).click();
  });

  test('publish action fires', async function(assert) {
    assert.expect(2);
    this.set('click', ()=>{
      assert.ok(true, 'action fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`{{publish-menu
      showPublish=true
      publishTranslation='general.publishCourse'
      publish=(action click)
      publishAsTbd=(action nothing)
      unpublish=(action nothing)
    }}`);
    const toggle = '.rl-dropdown-toggle';
    const dropDownItems = '.rl-dropdown button';
    const item = `${dropDownItems}:eq(0)`;

    this.$(toggle).click();
    assert.equal(this.$(item).text().trim(), 'Publish Course');
    this.$(item).click();
  });

  test('schedule action fires', async function(assert) {
    assert.expect(2);
    this.set('click', ()=>{
      assert.ok(true, 'action fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`{{publish-menu
      showTbd=true
      publish=(action nothing)
      publishAsTbd=(action click)
      unpublish=(action nothing)
    }}`);
    const toggle = '.rl-dropdown-toggle';
    const dropDownItems = '.rl-dropdown button';
    const item = `${dropDownItems}:eq(0)`;

    this.$(toggle).click();
    assert.equal(this.$(item).text().trim(), 'Mark as Scheduled');
    this.$(item).click();
  });

  test('unpublish action fires', async function(assert) {
    assert.expect(2);
    this.set('click', ()=>{
      assert.ok(true, 'action fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`{{publish-menu
      showUnPublish=true
      unPublishTranslation='general.unPublishCourse'
      publish=(action nothing)
      publishAsTbd=(action nothing)
      unpublish=(action click)
    }}`);
    const toggle = '.rl-dropdown-toggle';
    const dropDownItems = '.rl-dropdown button';
    const item = `${dropDownItems}:eq(0)`;

    this.$(toggle).click();
    assert.equal(this.$(item).text().trim(), 'UnPublish Course');
    this.$(item).click();
  });

  test('it renders with parent review object', async function(assert) {
    let testObj = EmberObject.create({
      allPublicationIssuesLength: 3
    });
    let parentTestObject = EmberObject.create({
      allPublicationIssuesLength: 8
    });
    this.set('testObj', testObj);
    this.set('parentTestObject', parentTestObject);
    this.set('nothing', parseInt);
    await render(hbs`{{publish-menu
      title='title'
      showAsIs=true
      showPublish=true
      showReview=true
      showTbd=true
      showUnPublish=true
      publishTranslation='general.publishCourse'
      unPublishTranslation='general.unPublishCourse'
      reviewRoute='course.publicationCheck'
      reviewObject=testObj
      parentObject=parentTestObject
      publish=(action nothing)
      publishAsTbd=(action nothing)
      unpublish=(action nothing)
    }}`);
    const toggle = '.rl-dropdown-toggle';
    const icon = `${toggle} i`;
    const dropDownItems = '.rl-dropdown button';
    const asIs = `${dropDownItems}:eq(0)`;
    const publish = `${dropDownItems}:eq(1)`;
    const review = `${dropDownItems}:eq(2)`;
    const schedule = `${dropDownItems}:eq(3)`;
    const unpublish = `${dropDownItems}:eq(4)`;


    assert.equal(this.$(toggle).text().trim(), 'title');
    assert.ok(this.$(icon).hasClass('fa-cloud'));

    this.$(toggle).click();
    assert.equal(this.$(dropDownItems).length, 5);
    assert.equal(this.$(asIs).text().trim(), 'Publish As-is');
    assert.equal(this.$(publish).text().trim(), 'Publish Course');
    assert.equal(this.$(review).text().trim(), 'Review 3 Missing Items');
    assert.equal(this.$(schedule).text().trim(), 'Mark as Scheduled');
    assert.equal(this.$(unpublish).text().trim(), 'UnPublish Course');
  });
});
