import FaIcon from 'ilios-common/components/fa-icon';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
<template>
  <span class="loading-spinner">
    <FaIcon @icon={{faSpinner}} @spin={{true}} />
  </span>
</template>
