import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | publish menu', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const testObj = EmberObject.create({
      allPublicationIssuesLength: 3
    });
    this.set('testObj', testObj);
    this.set('nothing', parseInt);
    await render(hbs`<PublishMenu
      @title="title"
      @showAsIs={{true}}
      @showPublish={{true}}
      @showReview={{true}}
      @showTbd={{true}}
      @showUnPublish={{true}}
      @publishTranslation="general.publishCourse"
      @unPublishTranslation="general.unPublishCourse"
      @reviewRoute="course.publication_check"
      @reviewObject={{testObj}}
      @publish={{action nothing}}
      @publishAsTbd={{action nothing}}
      @unpublish={{action nothing}}
    />`);
    const toggle = '[data-test-toggle]';
    const icon = `${toggle} svg`;
    const dropDownItems = '[data-test-menu] button';
    const asIs = `${dropDownItems}:nth-of-type(1)`;
    const publish = `${dropDownItems}:nth-of-type(2)`;
    const review = `${dropDownItems}:nth-of-type(3)`;
    const schedule = `${dropDownItems}:nth-of-type(4)`;
    const unpublish = `${dropDownItems}:nth-of-type(5)`;

    assert.dom(toggle).hasText('title');
    assert.dom(icon).hasClass('fa-cloud');

    await click(toggle);
    assert.dom(dropDownItems).exists({ count: 5 });
    assert.dom(asIs).hasText('Publish As-is');
    assert.dom(publish).hasText('Publish Course');
    assert.dom(review).hasText('Review 3 Missing Items');
    assert.dom(schedule).hasText('Mark as Scheduled');
    assert.dom(unpublish).hasText('UnPublish Course');
  });

  test('as is action fires', async function(assert) {
    assert.expect(2);
    this.set('click', ()=>{
      assert.ok(true, 'action fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`<PublishMenu
      @showAsIs={{true}}
      @publish={{action click}}
      @publishAsTbd={{action nothing}}
      @unpublish={{action nothing}}
    />`);
    const toggle = '[data-test-toggle]';
    const dropDownItems = '[data-test-menu] button';
    const item = `${dropDownItems}:nth-of-type(1)`;

    await click(toggle);
    assert.dom(item).hasText('Publish As-is');
    await click(item);
  });

  test('publish action fires', async function(assert) {
    assert.expect(2);
    this.set('click', ()=>{
      assert.ok(true, 'action fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`<PublishMenu
      @showPublish={{true}}
      @publishTranslation="general.publishCourse"
      @publish={{action click}}
      @publishAsTbd={{action nothing}}
      @unpublish={{action nothing}}
    />`);
    const toggle = '[data-test-toggle]';
    const dropDownItems = '[data-test-menu] button';
    const item = `${dropDownItems}:nth-of-type(1)`;

    await click(toggle);
    assert.dom(item).hasText('Publish Course');
    await click(item);
  });

  test('schedule action fires', async function(assert) {
    assert.expect(2);
    this.set('click', ()=>{
      assert.ok(true, 'action fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`<PublishMenu
      @showTbd={{true}}
      @publish={{action nothing}}
      @publishAsTbd={{action click}}
      @unpublish={{action nothing}}
    />`);
    const toggle = '[data-test-toggle]';
    const dropDownItems = '[data-test-menu] button';
    const item = `${dropDownItems}:nth-of-type(1)`;

    await click(toggle);
    assert.dom(item).hasText('Mark as Scheduled');
    await click(item);
  });

  test('unpublish action fires', async function(assert) {
    assert.expect(2);
    this.set('click', ()=>{
      assert.ok(true, 'action fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`<PublishMenu
      @showUnPublish={{true}}
      @unPublishTranslation="general.unPublishCourse"
      @publish={{action nothing}}
      @publishAsTbd={{action nothing}}
      @unpublish={{action click}}
    />`);
    const toggle = '[data-test-toggle]';
    const dropDownItems = '[data-test-menu] button';
    const item = `${dropDownItems}:nth-of-type(1)`;

    await click(toggle);
    assert.dom(item).hasText('UnPublish Course');
    await click(item);
  });

  test('it renders with parent review object', async function(assert) {
    const testObj = EmberObject.create({
      allPublicationIssuesLength: 3
    });
    const parentTestObject = EmberObject.create({
      allPublicationIssuesLength: 8
    });
    this.set('testObj', testObj);
    this.set('parentTestObject', parentTestObject);
    this.set('nothing', parseInt);
    await render(hbs`<PublishMenu
      @title="title"
      @showAsIs={{true}}
      @showPublish={{true}}
      @showReview={{true}}
      @showTbd={{true}}
      @showUnPublish={{true}}
      @publishTranslation="general.publishCourse"
      @unPublishTranslation="general.unPublishCourse"
      @reviewRoute="course.publication_check"
      @reviewObject={{testObj}}
      @parentObject={{parentTestObject}}
      @publish={{action nothing}}
      @publishAsTbd={{action nothing}}
      @unpublish={{action nothing}}
    />`);
    const toggle = '[data-test-toggle]';
    const icon = `${toggle} svg`;
    const dropDownItems = '[data-test-menu] button';
    const asIs = `${dropDownItems}:nth-of-type(1)`;
    const publish = `${dropDownItems}:nth-of-type(2)`;
    const review = `${dropDownItems}:nth-of-type(3)`;
    const schedule = `${dropDownItems}:nth-of-type(4)`;
    const unpublish = `${dropDownItems}:nth-of-type(5)`;

    assert.dom(toggle).hasText('title');
    assert.dom(icon).hasClass('fa-cloud');

    await click(toggle);
    assert.dom(dropDownItems).exists({ count: 5 });
    assert.dom(asIs).hasText('Publish As-is');
    assert.dom(publish).hasText('Publish Course');
    assert.dom(review).hasText('Review 3 Missing Items');
    assert.dom(schedule).hasText('Mark as Scheduled');
    assert.dom(unpublish).hasText('UnPublish Course');
  });
});
