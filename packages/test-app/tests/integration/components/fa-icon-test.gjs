import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { htmlSafe } from '@ember/template';
import { component } from 'ilios-common/page-objects/components/fa-icon';
import FaIcon from 'ilios-common/components/fa-icon';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

module('Integration | Component | fa-icon', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders check', async function (assert) {
    await render(<template><FaIcon @icon={{faCheck}} /></template>);
    assert.dom('*').hasText('');
    assert.strictEqual(component.type, 'check');
    assert.strictEqual(component.classes, 'awesome-icon fa-check');
    assert.ok(component.innerUse);
    assert.strictEqual(component.innerUse.href, '/fontawesome/solid.svg#check');
  });

  test('it renders extra classes', async function (assert) {
    this.set('class', 'foo-xyz');
    await render(<template><FaIcon @icon={{faCheck}} class={{this.class}} /></template>);
    assert.strictEqual(component.classes, 'awesome-icon fa-check foo-xyz');
    this.set('class', 'foo-new-class');
    assert.strictEqual(component.classes, 'awesome-icon fa-check foo-new-class');
  });

  test('it optionally renders spin class', async function (assert) {
    this.set('isSpinning', false);
    await render(<template><FaIcon @icon={{faCheck}} @spin={{this.isSpinning}} /></template>);
    assert.strictEqual(component.classes, 'awesome-icon fa-check');
    this.set('isSpinning', true);
    assert.strictEqual(component.classes, 'awesome-icon fa-check spin');
  });

  test('it optionally renders fixed-width class', async function (assert) {
    this.set('fixedWidth', false);
    await render(<template><FaIcon @icon={{faCheck}} @fixedWidth={{this.fixedWidth}} /></template>);
    assert.strictEqual(component.classes, 'awesome-icon fa-check');
    this.set('fixedWidth', true);
    assert.strictEqual(component.classes, 'awesome-icon fa-check fixed-width');
  });

  test('it renders vertically and horizontally flipped', async function (assert) {
    this.set('flip', '');
    await render(<template><FaIcon @icon={{faCheck}} @flip={{this.flip}} /></template>);
    assert.strictEqual(component.classes, 'awesome-icon fa-check');
    this.set('flip', 'horizontal');
    assert.strictEqual(component.classes, 'awesome-icon fa-check flip-horizontal');
    this.set('flip', 'vertical');
    assert.strictEqual(component.classes, 'awesome-icon fa-check flip-vertical');
    this.set('flip', 'both');
    assert.strictEqual(component.classes, 'awesome-icon fa-check flip-horizontal flip-vertical');
  });

  test('it binds title', async function (assert) {
    const title = 'awesome is as awesome does';
    this.set('title', title);
    await render(<template><FaIcon @icon={{faCheck}} @title={{this.title}} /></template>);
    assert.ok(component.title, 'has title element');
    assert.strictEqual(component.title.text, title, 'title is correct');
    assert.ok(component.ariaLabelledBy);
  });

  test('no title attribute gives no title element', async function (assert) {
    await render(<template><FaIcon @icon={{faCheck}} /></template>);
    assert.notOk(component.title.exists, 'has no title element');
  });

  test('title from string like object', async function (assert) {
    const title = 'awesome is as awesome does';
    this.set('title', htmlSafe(title));
    await render(<template><FaIcon @icon={{faCheck}} @title={{this.title}} /></template>);
    assert.ok(component.title, 'has title element');
    assert.strictEqual(component.title.text, title, 'title is correct');
  });

  test('it renders with the default focusable attribute as false', async function (assert) {
    await render(<template><FaIcon @icon={{faCheck}} /></template>);
    assert.strictEqual(component.focusable, 'false');
  });

  test('it should change the focusable attribute to true', async function (assert) {
    await render(<template><FaIcon @icon={{faCheck}} focusable="true" /></template>);
    assert.strictEqual(component.focusable, 'true');
  });

  test('it defaults to ariaHidden', async function (assert) {
    await render(<template><FaIcon @icon={{faCheck}} /></template>);
    assert.strictEqual(component.ariaHidden, 'true');
  });

  test('it binds ariaHidden', async function (assert) {
    this.set('ariaHidden', 'true');
    await render(<template><FaIcon @icon={{faCheck}} aria-hidden={{this.ariaHidden}} /></template>);
    assert.strictEqual(component.ariaHidden, 'true');
    this.set('ariaHidden', 'false');
    assert.strictEqual(component.ariaHidden, 'false');
    this.set('ariaHidden', false);
    assert.notOk(component.ariaHidden, 'true');
  });

  test('role defaults to img', async function (assert) {
    await render(<template><FaIcon @icon={{faCheck}} /></template>);
    assert.strictEqual(component.role, 'img');
  });

  test('it binds role', async function (assert) {
    this.set('role', 'img');
    await render(<template><FaIcon @icon={{faCheck}} role={{this.role}} /></template>);
    assert.strictEqual(component.role, 'img');
    this.set('role', 'presentation');
    assert.strictEqual(component.role, 'presentation');
    this.set('role', false);
    assert.notOk(component.role);
  });

  test('it binds attributes', async function (assert) {
    this.set('height', '5px');
    this.set('width', '6px');
    this.set('x', '19');
    this.set('y', '81');

    await render(
      <template>
        <FaIcon
          @icon={{faCheck}}
          height={{this.height}}
          width={{this.width}}
          x={{this.x}}
          y={{this.y}}
        />
      </template>,
    );

    assert.strictEqual(component.height, '5px', 'first icon layer has correct height attribute');
    assert.strictEqual(component.width, '6px', 'first icon layer has correct width attribute');
    assert.strictEqual(component.x, '19', 'first icon layer has correct x attribute');
    assert.strictEqual(component.y, '81', 'first icon layer has correct y attribute');
    this.set('height', '10rem');
    this.set('width', '10rem');
    this.set('x', '2');
    this.set('y', '2');
    assert.strictEqual(
      component.height,
      '10rem',
      'first icon layer has correct new height attribute',
    );
    assert.strictEqual(
      component.width,
      '10rem',
      'first icon layer has correct new width attribute',
    );
    assert.strictEqual(component.x, '2', 'first icon layer has correct new x attribute');
    assert.strictEqual(component.y, '2', 'first icon layer has correct new y attribute');
  });

  test('it renders no surrounding whitespace', async function (assert) {
    await render(<template><FaIcon @icon={{faCheck}} /></template>);
    assert.ok(this.element.innerHTML.startsWith('<svg '));
    assert.ok(this.element.innerHTML.endsWith('</svg>'));
  });

  test('it accepts listItem', async function (assert) {
    this.set('listItem', false);
    await render(<template><FaIcon @icon={{faCheck}} @listItem={{this.listItem}} /></template>);
    assert.strictEqual(component.classes, 'awesome-icon fa-check');
    this.set('listItem', true);
    assert.strictEqual(component.classes, 'awesome-icon fa-check list-item');
  });
});
