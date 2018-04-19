'use strict';

function Article (rawDataObj) {
 
  Object.keys(rawDataObj).forEach(key => {
    this[key] = rawDataObj[key];
  }, this);
}

Article.all = [];

Article.prototype.toHtml = function() {
  var template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: The parameter was refactored to expect the data from the database, rather than a local file.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
};

Article.fetchAll = callback => {
  $.get('/articles')
    .then(
      function(results) {
      // REVIEW: Call loadAll, and pass in the results, then invoke the callback.
        Article.loadAll(results);
        callback();
      }
    )
};


// REVIEW: Take a few minutes and review what each of these new methods do in relation to our server and DB
Article.truncateTable = callback => {
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
    .then(data => {
      console.log(data);
      if (callback) callback();
    });
};

Article.prototype.insertRecord = function(callback) {
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
    .then(data => {
      console.log(data);
      if (callback) callback();
    })
};

Article.prototype.deleteRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
    .then(data => {
      console.log(data);
      if (callback) callback();
    });
};

Article.prototype.updateRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
    .then(data => {
      console.log(data);
      if (callback) callback();
    });
};
