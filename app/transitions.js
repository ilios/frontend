import config from './config/environment';

function getDuration(duration) {
  return config.environment === 'test' ? 0 : duration;
}

export default function(){
  this.transition(
    this.hasClass('horizontal'),
    this.toValue(true),
    this.use('toLeft', {duration: getDuration(1000)}),
    this.reverse('toRight', {duration: getDuration(1000)})
  );
  this.transition(
    this.hasClass('vertical'),
    this.toValue(true),
    this.use('toDown', {duration: getDuration(1000)}),
    this.reverse('toUp', {duration: getDuration(1000)})
  );
  this.transition(
    this.hasClass('crossFade'),
    this.toValue(true),
    this.use('crossFade', {duration: getDuration(1000)})
  );
}
