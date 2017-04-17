// @flow
const fetch = require('node-fetch');

class WSCNApi {
  headers: Object;
  constructor() {
    this.headers = {
      'User-Agent': 'WSCN/5.0.0 (iPhone; iOS 10.3.1; Scale/2.00)',
      'X-Ivanka-App': 'wscn|iOS|5.0.0|10.3.1|0',
    };
  }

  async fetchArticle(article_id: string) {
    if (!article_id) {
      return null;
    }
    let url = 'https://api-prod.wallstreetcn.com/apiv1/content/articles/';
    url += article_id + '?extract=1';
    console.log('fetchArticle ' + url);
    let article = await fetch(url, {
      method: 'get',
      headers: this.headers,
    }).then((response) => {return response.json();}
        ).then((json) => {
          try {
            if (json.data.content_args[0].type === 'audio') {
              return json.data;
            } else {
              return null;
            }
          } catch(err) {
            console.error(err);
            return null;
          }
        })
        .catch((err) => { 
          console.error(err);
          return null;
        });
    return article;
  }

  async fetchArticles() {
    let user_ids = ['66068', '75',];
    let all = [];
    for (var i = 0; i < user_ids.length; i++) {
      var user_id = user_ids[i];
      let url = 'https://api-prod.wallstreetcn.com/apiv1/content/user/articles';
      url += '?limit=10&user_id=' + user_id;
      console.log('fetchArticles ', url);
      let articles = await fetch(url, {
        method: 'get',
        headers: this.headers,
      }).then((response) => {return response.json();})
      .then((json) => {
        try {
          let items = json.data.items;
          return items;
        } catch (error) {
          console.error(error);
          return [];
        }
      }).catch((error) => {
        console.error(error);
        return [];
      });
      all = all.concat(articles);
    }
    return all;
  }

  genDateKey(date: Date) {
    let key = date.toLocaleDateString('zh-CN').replace(/\//g, '-');
    return key;
  }
}

module.exports = new WSCNApi();