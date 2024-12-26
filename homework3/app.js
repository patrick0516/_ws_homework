import { Application, Router } from "https://deno.land/x/oak/mod.ts"; // 引入 Oak 框架，用於路由和應用管理
import * as render from './render.js'; // 引入自定義渲染模組，用於生成 HTML
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // 引入 SQLite 資料庫模組

// 初始化 SQLite 資料庫
const db = new DB("blog.db");

// 如果資料表不存在則建立資料表
db.query(`
  CREATE TABLE IF NOT EXISTS markdb (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    body TEXT,
    user TEXT
  )
`);

// 初始化用戶，並將其加入資料庫（如果尚未存在）
const users = ['Mark', 'Markerpen'];
for (const user of users) {
  console.log(user); // 輸出用戶名稱（方便調試）
  db.query("INSERT OR IGNORE INTO markdb (title, body, user) VALUES (?, ?, ?)", [user, `${user}'s body content`, user]);
}

// 建立路由器實例
const router = new Router();

// 定義路由及其處理函數
router.get ('/'              , list     )       // 列出所有獨特用戶
      .get ('/:user/'        , list_titles)    // 列出特定用戶的文章標題
      .get ('/:user/post/new', add      )       // 提供新增文章的表單
      .get ('/:user/post/:id', show     )       // 顯示特定文章
      .post('/:user/post'    , create   );      // 新增文章

// 建立並配置應用程式
const app = new Application();
app.use(router.routes()); // 使用路由
app.use(router.allowedMethods()); // 允許合適的 HTTP 方法

// 資料庫查詢輔助函數
function query(sql, params = []) {
  let list = [];
  console.log(db.query("SELECT count(id) FROM markdb")); // 調試用：顯示資料表中的記錄數量
  
  for (const row of db.query(sql, params)) {
    // 解析 SELECT 子句以獲取欄位名稱
    const keys = sql.match(/SELECT\s+(.*?)\s+FROM/i)?.[1]?.split(',').map(k => k.trim()) || [];
    let obj = {};
    keys.forEach((key, index) => {
      obj[key] = row[index];
    });
    list.push(obj);
  }

  return list;
}

// 處理列出所有獨特用戶的請求
async function list(ctx) {
  let posts = query("SELECT user FROM markdb"); // 查詢所有用戶
  const seen = new Set();
  const uniqueList = posts.filter(item => {
    if (seen.has(item.user)) {
      return false;
    }
    seen.add(item.user);
    return true;
  });
  ctx.response.body = await render.list(uniqueList); // 渲染用戶列表
}

// 處理列出特定用戶文章標題的請求
async function list_titles(ctx) {
  const user = ctx.params.user; // 從 URL 中提取用戶名稱
  let posts = query("SELECT id, title, body, user FROM markdb WHERE user = ?", [user]); // 查詢該用戶的文章
  ctx.response.body = await render.list_titles(user, posts); // 渲染文章標題
}

// 處理新增文章表單的請求
async function add(ctx) {
  const user = ctx.params.user; // 從 URL 中提取用戶名稱
  ctx.response.body = await render.newPost(user); // 渲染新增文章的表單
}

// 處理顯示特定文章的請求
async function show(ctx) {
  const user = ctx.params.user; // 從 URL 中提取用戶名稱
  const pid = ctx.params.id; // 從 URL 中提取文章 ID
  let posts = query("SELECT id, title, body FROM markdb WHERE id = ? AND user = ?", [pid, user]); // 查詢文章
  let post = posts[0];
  if (!post) ctx.throw(404, 'invalid post id'); // 如果文章不存在，返回 404 錯誤
  ctx.response.body = await render.show(user, post); // 渲染文章內容
}

// 處理新增文章的請求
async function create(ctx) {
  const user = ctx.params.user; // 從 URL 中提取用戶名稱
  const body = ctx.request.body(); // 解析請求主體
  if (body.type() === "form") {
    const pairs = await body.form(); // 解析表單資料
    const post = {};
    for (const [key, value] of pairs) {
      post[key] = value;
    }
    db.query("INSERT INTO markdb (title, body, user) VALUES (?, ?, ?)", [post.title, post.body, user]); // 將資料插入資料庫
    ctx.response.redirect(`/${user}/`); // 重定向到用戶的文章列表
  }
}

// 配置埠號並啟動伺服器
let port = parseInt(Deno.args[0]) || 8000;
console.log(`Server run at http://127.0.0.1:${port}`);
await app.listen({ port }); // 監聽配置的埠號
