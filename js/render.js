'use strict';

var github = new Github({
  token: TOKEN,
  auth: 'oauth'
});

// default sorting order
function order(a, b) {
  return a.updatedAt < b.updatedAt ?
    1 : a.updatedAt === b.updatedAt ?
    0 : -1;
}

// generates html from a github issue
function generate(issue) {
  var search = window.location.search;
  if (search && search.indexOf(issue.id) === -1)
    return;
  else
    document.title = issue.title;

  var parent = document.querySelector('.threads'),
      content = [];

  parent.innerHTML += '<div id="' + issue.id + '" class="post">';
  parent.innerHTML += '<h1 class="post-title">';
  parent.innerHTML += '<a href="?' + issue.id + '">' + issue.title + '</a>';
  parent.innerHTML += '</h1>';
  parent.innerHTML += '<div class="post-meta-categories">';
  issue.labels.forEach(function (label) {
    parent.innerHTML += '<span class="post-meta-category" style="background: #' + label.color + '">';
    parent.innerHTML += label.name;
    parent.innerHTML += '</span>';
  });
  parent.innerHTML += '</div>';
  parent.innerHTML += '<div class="post-meta">';
  parent.innerHTML += 'by <a href="' + issue.user.html_url + '">' + issue.user.login + '</a>, ';
  parent.innerHTML += new Date(issue.created_at).toLocaleDateString();
  parent.innerHTML += '</div>';
  parent.innerHTML += '<div class="post-body' + (search ? ' active">' : '" onclick="this.classList.toggle(\'active\');">');
  parent.innerHTML += marked(issue.body);
  if (search) {
    parent.innerHTML += '<a href="https://twitter.com/share" class="twitter-share-button" data-via="casualjs" data-size="large">Tweet</a>';
    parent.innerHTML += '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?"http":"https";if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document, "script", "twitter-wjs")</script>';
  }
  parent.innerHTML += '</div>';
  parent.innerHTML += '</div>';

  if (issue.comments) {
    var commentContainer = document.createElement('div');
    commentContainer.className = 'post-comments';
    commentContainer.innerHTML = 'Loading ' + issue.comments + ' comments...';

    parent.appendChild(commentContainer);

    github._request('GET', issue.comments_url, {}, function (error, data) {
      if (error)
        return;

      commentContainer.innerHTML = '';

      var comments = [];
      data.forEach(function (comment) {
        comments.push('<div id="' + comment.id + '" class="post-comment">');
        comments.push('<a class="post-comment-author" href="' + comment.user.html_url + '">');
        comments.push(comment.user.login);
        comments.push('</a>');
        comments.push('<span class="post-comment-date">');
        comments.push(new Date(comment.created_at).toLocaleDateString());
        comments.push('</span>');
        comments.push('<div class="post-comment-body">');
        comments.push(marked(comment.body));
        comments.push('</div>');
        comments.push('</div>');
      });

      comments.push('<a href="' + issue.html_url + '">add comment</a>');
      commentContainer.innerHTML += comments.join('');
    });
  } else
    parent.innerHTML += '<a href="' + issue.html_url + '">add comment</a>';
}

// renders github issues
function render() {
  github
    .getIssues(USERNAME, REPO)
    .list({}, function (error, issues) {
      if (error || !issues)
        return;

      document.querySelector('.threads').innerHTML = '';
      issues.sort(order).forEach(generate);
    });
}
