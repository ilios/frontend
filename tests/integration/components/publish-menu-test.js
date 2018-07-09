import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, find } from '@ember/test-helpers';
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
    const asIs = `${dropDownItems}:nth-of-type(1)`;
    const publish = `${dropDownItems}:nth-of-type(2)`;
    const review = 'a:nth-of-type(1)';
    const schedule = `${dropDownItems}:nth-of-type(3)`;
    const unpublish = `${dropDownItems}:nth-of-type(4)`;

    assert.equal(find(toggle).textContent.trim(), 'title');
    assert.ok(find(icon).classList.contains('fa-cloud'));

    await click(toggle);
    assert.equal(findAll(dropDownItems).length, 5);
    assert.equal(find(asIs).textContent.trim(), 'Publish As-is');
    assert.equal(find(publish).textContent.trim(), 'Publish Course');
    assert.equal(find(review).textContent.trim(), 'Review 3 Missing Items');
    assert.equal(find(schedule).textContent.trim(), 'Mark as Scheduled');
    assert.equal(find(unpublish).textContent.trim(), 'UnPublish Course');
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
    const item = `${dropDownItems}:nth-of-type(1)`;

    await click(toggle);
    assert.equal(find(item).textContent.trim(), 'Publish As-is');
    await click(item);
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
    const item = `${dropDownItems}:nth-of-type(1)`;

    await click(toggle);
    assert.equal(find(item).textContent.trim(), 'Publish Course');
    await click(item);
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
    const item = `${dropDownItems}:nth-of-type(1)`;

    await click(toggle);
    assert.equal(find(item).textContent.trim(), 'Mark as Scheduled');
    await click(item);
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
    const item = `${dropDownItems}:nth-of-type(1)`;

    await click(toggle);
    assert.equal(find(item).textContent.trim(), 'UnPublish Course');
    await click(item);
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
    const asIs = `${dropDownItems}:nth-of-type(1)`;
    const publish = `${dropDownItems}:nth-of-type(2)`;
    const review = 'a:nth-of-type(1)';
    const schedule = `${dropDownItems}:nth-of-type(3)`;
    const unpublish = `${dropDownItems}:nth-of-type(4)`;


    assert.equal(find(toggle).textContent.trim(), 'title');
    assert.ok(find(icon).classList.contains('fa-cloud'));

    await click(toggle);
    assert.equal(findAll(dropDownItems).length, 5);
    assert.equal(find(asIs).textContent.trim(), 'Publish As-is');
    assert.equal(find(publish).textContent.trim(), 'Publish Course');
    assert.equal(find(review).textContent.trim(), 'Review 3 Missing Items');
    assert.equal(find(schedule).textContent.trim(), 'Mark as Scheduled');
    assert.equal(find(unpublish).textContent.trim(), 'UnPublish Course');
  });
});
