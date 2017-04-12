const Koa = require('koa');
const _ = require('lodash');
const app = new Koa();
const schedule = require('node-schedule');
const router = require('koa-better-router')().loadMethods();
const storage = require('./storage');
const rss = require('rss');
app.context.db = storage.db;

// routes
router.get('/update', (ctx, next) => {
    storage.fetchTodayProgram();
    ctx.body = 'Updating...';
});

router.get('/feed', async (ctx, next) => {
    await next();
    let feed = new rss({
        title: 'unofficial feed for FMRadio(wallstreetcn.com)',
        author: '华尔街见闻',
        feed_url: 'https://wscn-fm.herokuapp.com/feed',
        image_url: 'https://wpimg.wallstcn.com/9a897aa6-9ff4-480c-93e3-02733556543e'
    });

    var programs = await storage.programs();
    _.each(programs, (program) => {
        console.log('add ')
        feed.item({
            title: program.title,
            description: program.content_short,
            url: program.content_args[0].uri,
            guid: program.id,
            date: new Date(program.display_time).toLocaleTimeString('zh-CN'),
            enclosure: {url: program.content_args[0].uri, type: 'audio'}
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

schedule.scheduleJob('0 0 12 * * ?', () => {
    storage.fetchTodayProgram();
});

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    process.exit();
});

console.log('please visit http://127.0.0.1:3000');
app.listen(process.env.PORT || 3000);
