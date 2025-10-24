import Component from '@glimmer/component';
import { service } from '@ember/service';
import { array } from '@ember/helper';
import Overview from 'ilios-common/components/session/overview';
import SessionCopy from 'ilios-common/components/session-copy';
import noop from 'ilios-common/helpers/noop';
import animateLoading from 'ilios-common/modifiers/animate-loading';

export default class SessionCopyLoadingComponent extends Component {
  @service store;
  @service router;

  get session() {
    const sessionId = this.router.currentRoute.parent.params.session_id;

    if (!sessionId) {
      return null;
    }

    return this.store.peekRecord('session', sessionId);
  }
  <template>
    <div class="session-details">
      <Overview
        @session={{this.session}}
        @editable={{false}}
        @showCheckLink={{false}}
        @sessionTypes={{(array)}}
      />
      <SessionCopy
        @session={{this.session}}
        @visit={{(noop)}}
        class="loading"
        {{animateLoading "session-copy" finalOpacity=0.25 loadingTime=10000}}
      />
    </div>
  </template>
}
