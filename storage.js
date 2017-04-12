const Datastore = require('nedb-promise');
const _ = require('lodash');
const api = require('./api');

class Storage {
    constructor() {
        this.db = new Datastore({filename: 'fm_radios.db', autoload: true});
    }

    async programs() {
        let programs = await this.db.find({});
        return programs;
    }

    async fetchTodayProgram() {
        let today_key = api.genDateKey(new Date());
        let radio = await this.db.findOne({ 'date_key': today_key});
        if (!radio) {
            console.log('try fetch today\'s (' + today_key + ')radio');
            let articles = await api.fetchArticles();
            let id = _.first(_.map(articles, (article) => {
                let key = api.genDateKey(new Date(article.display_time));
                return article.id;
            }));
            if (id) {
                let detail = await api.fetchArticle(id);
                if (detail) {
                    let program = _.pick(detail, ['content_args', 'content_short', 
                    'display_time', 'id', 'image_uri', 'title']);
                    console.log('insert ', program);
                    program.date_key = today_key;
                    await this.db.insert(program);
                }
            }
        } else {
            console.log('skip fetch today\'s radio');
        }
    }
}

module.exports = new Storage();