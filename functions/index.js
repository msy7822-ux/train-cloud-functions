const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// firestoreからbooksドキュメントを取得するエンドポイント
exports.fetchBookInfo = functions.https.onRequest((request, response) => {
  // fetchBookInfo関数では、GETリクエスト以外のリクエスト全てに対してエラーを返す
  if (request.method !== 'GET') response.status(400).send("リクエストタイプが不正です。");

  // クエリとしてisbn番号を受け取る
  const isbn = request.query.isbn;

  // クエリ文字列が渡されなかったらエラーを返す
  if (!isbn) response.status(400).send('クエリが不正です。');

  const db = admin.firestore();
  db.collection('books').doc(isbn).get()
    .then(res => {
      const json = JSON.stringify(res.data(), null, '\t');
      response.send(json);
      return null;
    }).catch(err => {
      console.log(err);
      response.status(500).send(err);
    });
});
