const fetch = require('node-fetch');

class WSCNApi {
    constructor() {
        this.headers = {
            'User-Agent': 'WSCN/5.0.0 (iPhone; iOS 10.3.1; Scale/2.00)',
            'X-Ivanka-App': 'wscn|iOS|5.0.0|10.3.1|0'
        }
    }
    async fetchArticle(article_id) {
        if (!article_id) {
            return null;
        }
        let url = 'https://api-prod.wallstreetcn.com/apiv1/content/articles/'
        url += article_id + '?extract=1';
        console.log(url);
        let article = await fetch(url, {
            method: 'get',
            headers: this.headers
        }).then((response) => {return response.json()}
        ).then((json) => {
            try {
                let content_args = json.data.content_args;
                return json.data;
            } catch(err) {
                console.error(err);
                return null;
            }
        })
        .catch((err) => { 
            console.error(err);
            return null
        });
        return article
    }

    async fetchArticles() {
        let url = 'https://api-prod.wallstreetcn.com/apiv1/content/user/articles'
        url += '?user_id=66068&limit=10'
        console.log('fetchArticles ', url);
        let articles = await fetch(url, {
            method: 'get',
            headers: this.headers
        }).then((response) => {return response.json()}
        ).then((json) => {
            try {
                let items = json.data.items;
                return items;
            } catch (error) {
                console.error(error);
                return [];
            };
        }).catch((error) => {
            console.error(error);
            return [];
        });
        return articles;
    }

    genDateKey(date) {
        let key = date.toLocaleDateString('zh-CN').replace(/\//g, '-');
        return key;
    }
}

module.exports = new WSCNApi();