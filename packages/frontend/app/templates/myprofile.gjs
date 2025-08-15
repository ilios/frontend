import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import MyProfile from 'frontend/components/my-profile';
import set from 'ember-set-helper/helpers/set';
<template>
  {{pageTitle (t "general.myProfile")}}
  <MyProfile
    @user={{@model}}
    @showCreateNewToken={{@controller.showCreateNewToken}}
    @toggleShowCreateNewToken={{@controller.toggleShowCreateNewToken}}
    @showInvalidateTokens={{@controller.showInvalidateTokens}}
    @toggleShowInvalidateTokens={{@controller.toggleShowInvalidateTokens}}
    @permissionsSchool={{@controller.permissionsSchool}}
    @permissionsYear={{@controller.permissionsYear}}
    @setPermissionsSchool={{set @controller "permissionsSchool"}}
    @setPermissionsYear={{set @controller "permissionsYear"}}
  />
</template>
