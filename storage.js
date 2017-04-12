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

    async fetchPrograms() {
        let articles = await api.fetchArticles();
        let ids = _.filter(articles, async (article) => {
            let key = api.genDateKey(new Date(article.display_time));
            let radio = await this.db.findOne({ 'date_key': key});
            return !radio;
        }).map(async (article) => {
            let detail = await api.fetchArticle(article.id);
            if (detail) {                
                let program = _.pick(detail, ['content_args', 'content_short', 
                'display_time', 'id', 'image_uri', 'title']);
                let date_key = api.genDateKey(new Date(program.display_time * 1000));
                console.log('insert ', program.id);
                program.date_key = date_key;
                await this.db.insert(program);
            }
        });
    }
}

module.exports = new Storage();