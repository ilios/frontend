import Overview from '../../components/session/overview';
import SessionCopy from '../../components/session-copy';
<template>
  <div class="session-details">
    <Overview
      @session={{@model}}
      @editable={{false}}
      @showCheckLink={{false}}
      @sessionTypes={{@model.sessionTypes}}
    />
    <SessionCopy @session={{@model}} @visit={{@controller.loadSession}} />
  </div>
</template>
