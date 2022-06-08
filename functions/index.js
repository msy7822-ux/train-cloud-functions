const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// firestoreからbooksドキュメントを取得するエンドポイント
exports.fetchBookInfo = functions.https.onRequest((request, response) => {
  // fetchBookInfo関数では、GETリクエスト以外のリクエスト全てに対してエラーを返す
  if (request.method !== 'GET') response.status(400).send("リクエストタイプが不正です。");

  // クエリとしてisbn番号を受け取る
  const isbn = request.query.isbn;

  // クエリ文字列が渡されなかったらドキュメントを全件取得したい
  if (!isbn) {
    // 特定のコレクションから、ドキュメントを全件取得する
    db.collection('books').get().then(res => {
      const json = JSON.stringify(res.docs, null, ' ');
      response.send(json);
      return ;
    }).catch(err => {
      console.log(err);
      response.status(500).send(err);
    });
  } else {
    // クエリ文字があれば、特定のドキュメントのデータを返す
    db.collection('books').doc(isbn).get()
      .then(res => {
        const json = JSON.stringify(res.data(), null, '\t');
        response.send(json);
        return null;
      }).catch(err => {
        console.log(err);
        response.status(500).send(err);
      });
  }

});

// firebaseにbooksドキュメントを追加するエンドポイント
exports.addBookInfo = functions.https.onRequest((request, response) => {
  // POSTリクエスト以外のリクエストを拒否る
  if (request.method !== 'POST') response.status(400).send('リクエストが不正です。');

  // リクエストパラメータのバリデーション
  const body = request.body;
  if (!body) response.status(400).send("bodyの中身が不正です。");
  // ドキュメントID
  const isbn = Object.keys(body)[0];
  // 書籍情報
  const bookInfo = body[isbn];

  db.collection('books')
    .doc(isbn)
    .set({ bookInfo }, { merge: true })
    .then(() => {
      response.send('Completed');
      return;
    })
    .catch(err => {
      console.log(err);
      response.status(500).send(err);
    });

});
