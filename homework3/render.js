export function layout(title, content) {
  return `
  <html>
  <head>
    <title>${title}</title>
    <style>
      body {
        padding: 80px;
        font: 16px Helvetica, Arial;
      }
  
      h1 {
        font-size: 2em;
      }
  
      h2 {
        font-size: 1.2em;
      }
  
      #posts {
        margin: 0;
        padding: 0;
      }
  
      #posts li {
        margin: 40px 0;
        padding: 0;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
        -style: none;
      }
  
      #posts li:last-child {
        border-bottom: none;
      }
  
      textarea {
        width: 500px;
        height: 300px;
      }
  
      input[type=text],
      textarea {
        border: 1px solid #eee;
        border-top-color: #ddd;
        border-left-color: #ddd;
        border-radius: 2px;
        padding: 15px;
        font-size: .8em;
      }
  
      input[type=text] {
        width: 500px;
      }
    </style>
  </head>
  <body>
    <section id="content">
      ${content}
    </section>
  </body>
  </html>
  `
}

export function list(posts) {
    let UsersInList = [];
  
    for (let post of posts) 
    {
        UsersInList.push(`<li><a href="/${post.user}/">${post.user}</a></li>`);
    }
    return layout('User List', `<ol>${UsersInList.join('\n')}</ol>`);
}

export function list_titles(username , posts) {
  let list = []
  for (let post of posts) 
  {
    list.push(`
    <li>
      <h2>${ post.title }</h2>
      <p><a href="/${username}/post/${post.id}">Read post</a></p>
    </li>
    `)
  }
  let content = `
  <h1>Posts</h1>
  <p>You have <strong>${posts.length}</strong> posts!</p>
  <p><a href="/${username}/post/new">Create a Post</a></p>
  <ul id="posts">
    ${list.join('\n')}
  </ul>
  <a href="/"><p><input type="submit" value="back"></p></a>
  `
  return layout('Posts', content)
}

export function newPost(username) {
  return layout('New Post', `
  <h1>New Post</h1>
  <p>Create a new post.</p>
  <form action="/${username}/post" method="post">
    <p><input type="text" placeholder="Title" name="title"></p>
    <p><textarea placeholder="Contents" name="body"></textarea></p>
    <p><input type="submit" value="create"></p>
  </form>
  `)
}

export function show(username , post) {
  return layout(post.title, `
    <h1>${post.title}</h1>
    <p>${post.body}</p>
    <a href="/${username}/"><p><input type="submit" value="back"></p></a>
  `)
}
