import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import LoginForm from 'frontend/components/login-form';
<template>
  {{pageTitle (t "general.login")}}
  <LoginForm
    @noAccountExistsError={{@controller.noAccountExistsError}}
    @noAccountExistsAccount={{@controller.noAccountExistsAccount}}
  />
</template>
