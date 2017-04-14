// @flow
const Koa = require('koa');
const _ = require('lodash');
const app = new Koa();
const schedule = require('node-schedule');
const router = require('koa-better-router')().loadMethods();
const storage = require('./storage');
const rss = require('rss');
app.context.db = storage.db;

// routes
router.get('/update', (ctx) => {
  storage.fetchPrograms();
  ctx.body = 'Updating...';
});

router.get('/feed', async (ctx, next) => {
  await next();
  let feed = new rss({
    title: 'unofficial feed for FMRadio(wallstreetcn.com)',
    author: 'WSCN',
    link: 'https://wscn-fm.herokuapp.com/feed',
    feed_url: 'https://wscn-fm.herokuapp.com/feed',
    image_url: 'https://wpimg.wallstcn.com/9a897aa6-9ff4-480c-93e3-02733556543e',
  });

  var programs = await storage.programs();
  _.each(programs, (program) => {
    feed.item({
      title: program.title,
      description: ['Source: ' + program.article_url, program.content_short,].join('\n'),
      url: program.article_url,
      guid: program.id,
      date: new Date(program.display_time * 1000),
      enclosure: {url: program.content_args[0].uri, type: 'audio/mp3',},
    });
  });
  ctx.response.type = 'xml';
  ctx.response.body = feed.xml();
});

app.use(router.middleware());

// logger
app.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;    
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

schedule.scheduleJob('0 30 11 * * ?', () => {
  let date = new Date();
  console.log('scheduleJob fired at ' + date.toLocaleString('zh-CN'));
  storage.fetchPrograms();
});

console.log('please visit http://127.0.0.1:3000');
app.listen(process.env.PORT || 3000);
storage.fetchPrograms();
