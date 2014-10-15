module.exports = function(app) {
  var fixtures = [
    {
      id: 0,
      title: 'First Objective',
      competency: 2,
      meshDescriptors: [0]
    },
    {
      id: 1,
      title: 'Second Objective',
      competency: null,
      meshDescriptors: []
    },
    {
      id: 2,
      title: 'Third Objective',
      competency: 2,
      meshDescriptors: []
    },
    {
      id: 3,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque quis ornare justo. Donec mollis eget purus at rutrum. Pellentesque viverra molestie odio, sed feugiat purus pulvinar ut. Nam ac mollis erat. Nulla nulla lacus, placerat vel varius nec, sagittis a nunc. Phasellus ultrices viverra vehicula. Nunc commodo nisl interdum dui lacinia pulvinar. Praesent vel condimentum odio. Donec hendrerit ullamcorper nisi, a lacinia arcu tempor quis. Curabitur felis tortor, venenatis a fermentum sed, porta id urna. Etiam nec molestie ante. Morbi sit amet rutrum augue. Nullam malesuada malesuada turpis, quis pharetra nulla elementum nec. Cras tincidunt urna tempus rhoncus convallis. Nunc consequat, augue non porttitor pulvinar, justo augue pellentesque libero, vitae tincidunt nibh nulla eu elit. Nullam bibendum orci mauris, et elementum sapien maximus id. Curabitur iaculis volutpat gravida. Aliquam in urna eu urna malesuada accumsan. Etiam sed efficitur nulla. Nunc dignissim congue dolor ut sollicitudin. Nunc mauris lorem, sagittis ac lacinia a, dictum tincidunt tortor. Aliquam finibus placerat eros accumsan pretium. Donec purus neque, gravida et accumsan eget, euismod eu ipsum. Vivamus eget blandit ex. Vivamus consequat egestas dolor sit amet molestie. Nunc suscipit, ex ut aliquet tempor, diam felis facilisis quam, eu accumsan enim nibh vitae orci. Fusce eu nunc id nisi eleifend facilisis. Morbi placerat ultricies sollicitudin. Sed finibus, velit eget pellentesque facilisis, ligula turpis ultricies mauris, sit amet facilisis metus diam ac nisi. Aliquam vitae tempor ligula, ac pellentesque ante. Donec gravida id magna ut finibus. Ut nec facilisis nibh. In suscipit nec augue et pharetra. Vestibulum vehicula cursus lorem. Duis volutpat placerat mauris, et ultrices sapien convallis sed. Nullam suscipit erat vitae ligula hendrerit, sed accumsan neque rutrum. In interdum suscipit accumsan. Maecenas blandit sed justo sed vestibulum. Vivamus nibh nisl, congue at tempus in, convallis nec ipsum. Curabitur iaculis tempor lobortis. Cras vel lacinia odio, at ultrices sem. Morbi mattis, lacus a maximus pulvinar, eros felis fermentum elit, nec semper dui tellus a risus. Nulla vitae lobortis metus, quis commodo lacus. Donec faucibus viverra ornare. Donec pretium, quam vitae porttitor convallis, justo erat consectetur lacus, et interdum nisi eros nec odio. Cras dignissim elit porta feugiat imperdiet. Curabitur non blandit purus, ac sagittis eros. Duis cursus laoreet erat ut ultrices. Suspendisse rhoncus arcu sed sapien fringilla placerat. Suspendisse sodales finibus sapien quis scelerisque. Pellentesque convallis erat a nulla lobortis porta. Integer luctus lorem at quam scelerisque euismod. Nunc elementum in lorem quis sodales.',
      competency: 4,
      meshDescriptors: []
    },

  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('objective', fixtures);
  app.use('/api/objectives', router);
};
