const Parser = require('./common');
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

class Kmib extends Parser {
  constructor(refer) {
    super();
    this.refer = refer;
  }

  async setInsertSql(mappingkey) {
    const defineRefer = {
      encoding: null,
      method: 'get',
      url: this.refer.startsWith('http') ? this.refer : 'http://' + this.refer
    };
    const getSql = (err, response, html) => {
      // html utf8로 추출
      const htmlDoc = iconv.decode(new Buffer(html), 'EUC-KR');
      const $ = cheerio.load(htmlDoc);
      this.keywords = '';
      this.u_time = '';
      this.author = $('meta[property=\'dable:author\']').attr('content');
      this.context = $('#article').text().replace(/\s/gi, "");
      this.context = this.context.replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"");

      this.sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author, context) values('${this.refer}','news.kbs.co.kr','${mappingkey}','${this.title}','${this.description}','${this.image}','${this.keywords}','${this.p_time}','${this.u_time}','${this.section}','${this.author}' , '${this.context}')`;
    };

    await request(defineRefer, getSql);
  }

  get InsertSql() {
    return this.sql_insert;
  }
}

module.exports = Kmib;