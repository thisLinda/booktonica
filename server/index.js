const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const BooktonicaDatabase = require('./src/booktonica_database');
const cors = require('cors');
const path = require('path');


/**
 * A way to change the defaults.
 * You can run this app like:
 * `DB_NAME=osito npm start` and it will
 * use the DB named osito instead of DEFAULT_DB_NAME.
 */
const DEFAULT_PORT = 3001;
const PORT = process.env.PORT || DEFAULT_PORT;
const DEFAULT_DB_NAME = 'booktonica';
const dbName = process.env.DB_NAME || DEFAULT_DB_NAME;
const db = new BooktonicaDatabase(dbName);

const api = express();

// Middlewares
api.use(morgan('tiny'));
api.use(bodyParser.json());
api.use(cors());
//serve static files from the React app
api.use(express.static(path.join(__dirname, 'react-client/build')));

/**
 * This will just print the incoming request bodies
 * which is useful for debugging. You can skip it if you want
 * by removing
 */
const bodyDebugMiddleware = require('./src/body-debug-middleware');
api.use(bodyDebugMiddleware);

/**
 * Creates a new database object.
 * Add new database queries there.
 */
// const db = new BooktonicaDb(DB_NAME);

api.get('*', (_, res) => {
  res.sendFile(path.join(__dirname+'/react-client/build/index.html'));
});
// GET /books
api.get('/books', (_unused, res) =>
  db.getAllBooks().then(books => {
    // console.log(books)
    res.send(books);
  })
);

// GET /booksInList
api.get('/lists', (_unused, res) =>
// console.log('index.js get list request', booksInList)
  db.getAllBooksInList().then((booksInList) => {
    res.send(booksInList);
  })
);

// add book to bookList /booklist_books
api.post('/booklist_books', (req, res) =>
  db.addBookToList(req.body).then(book => {
    console.log('index.js express server', book);
    res.send(book);
  })
);

// GET /listsBooksBelongTo
api.get('/listsBookBelongsTo/:id', (req, res) =>
// console.log('index.js get list request', booksInList)
  db.getListBooksBelongTo(req.params.id).then((bookList) => {
    res.send(bookList);
  })
);

// GET /getBooksInList/:list_id
api.get('/booksInList/:list_id', (req, res) =>
// console.log('index.js get list request', booksInList)
  db.getBooksInList(req.params.list_id).then((books) => {
    res.send(books);
  })
);

// GET /bookLists
api.get('/booklists', (_unused, res) =>
  db. getBookList().then((booklists) => {
    // console.log('index.js get list request', booklists)
    res.send(booklists);
  })
);

// sanityCheck will make sure the DB is working before listening
db.sanityCheck().then(() => {
  let server = api.listen(process.env.PORT || 3001, function(){
    let host = server.address().address;
    let port = server.address().port;
    console.log(`booktonica is running at http://%s:%s", ${host}, ${port}`);
  });
});
