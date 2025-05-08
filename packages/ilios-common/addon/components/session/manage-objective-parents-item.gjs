{{#if @isSelected}}
  <label {{on "click" @remove}} class="selected">
    <input type="checkbox" checked="checked" />
    {{html-safe (remove-html-tags @title)}}
  </label>
{{else}}
  <label {{on "click" @add}}>
    <input type="checkbox" />
    {{html-safe (remove-html-tags @title)}}
  </label>
{{/if}}