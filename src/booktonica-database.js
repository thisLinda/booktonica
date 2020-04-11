const pgp = require('pg-promise')();

/**
 * An object that has methods matching useful database queries.
 * Use `this.db` to access a connected pg-promise connection.
 * Make sure to return the promise!
 *
 * For examples of other queries, see
 * [pghttps://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example
  */
 class BooktonicaDatabase {
   /**
    * @param {String} name - name of database to connect to
    */
   constructor(name) {
     const connectionString = `postgres://localhost:5432/${name}`;
     console.log('Postgres DB => ', connectionString);
     this.db = pgp(connectionString);
    }
    
    sanityCheck() {
      console.log('\tTesting database connection...');
      return this.getBooksCount().then(count =>
        console.log(`\t✔️ Found ${count} books.`)
        );
      }
  
    getAllBooks() {
      return this.db.any(
        `SELECT 
          b.id as book_id,
          b.title,
          b.subtitle,
          b.summary,
          b.cover_image_url,
          to_char(b.publication_date, 'DD Mon YYYY') as publication_date, 
          a.name AS author_name FROM books b 
          LEFT JOIN authors a on a.id = b.author_id
          ORDER BY b.publication_date DESC`
      );
    }

    //getting the listname of booklist and id
    getBookList() {
      return this.db.any(`SELECT list_name, list_id FROM booklists`);
    }

    //getting all books that belong to a booklist
    getAllBooksInList() {
      return this.db.any(
        `SELECT
      b.id as book_id,
      b.title,
      b.subtitle,
      b.summary,
      b.cover_image_url,
      to_char(b.publication_date, 'DD Mon YYYY') as publication_date, 
      a.name AS author_name,
      list_id,
      list_name
      FROM
      books as b
      INNER JOIN booklist_books as bb
      ON b.id = bb.book_id
      INNER JOIN booklists as list
      ON bb.booklist_id = list.list_id
      INNER JOIN authors a on a.id = b.author_id
      ORDER BY b.publication_date DESC`
      );
    }
    
    //add book to a booklist
    addBookToList(book){
      return this.db.none(
        //query only inserts if the row does not exist
        `INSERT INTO booklist_books (book_id, booklist_id) 
         SELECT $1, $2 
          WHERE NOT EXISTS (
            SELECT $1, $2 FROM  booklist_books WHERE book_id = $1 AND booklist_id = $2
          )`, [book.book_id, book.list_id]
      )
    }

    //getting the books that belong to a specific booklist
    getBooksInList(list_id) {
      console.log('getBooksInList list_id', list_id)
      return this.db.any(
        `SELECT
      b.id as book_id,
      b.title,
      b.subtitle,
      b.summary,
      b.cover_image_url,
      to_char(b.publication_date, 'DD Mon YYYY') as publication_date, 
      a.name AS author_name,
      list_id,
      list_name
      FROM
      books as b
      INNER JOIN booklist_books as bb
      ON b.id = bb.book_id
      INNER JOIN booklists as list
      ON bb.booklist_id = list.list_id
      INNER JOIN authors a on a.id = b.author_id
      WHERE list.list_id = $1`, [list_id]
      );
    }

    getBooksCount() {
      return this.db.one('SELECT count(*) FROM books').then(r => r.count);
    }
    
    getTotalCountOfBooksInList(booklist_id) {
      return this.db.any(
        `SELECT
        b.id as b_id,
        list_name
        FROM
        books as b
        JOIN booklist_books as bb
        ON b.id = bb.book_id
        JOIN booklists as list
        ON bb.booklist_id = list.list_id
        Where list_id = $1`, [booklist_id]
      );
    }


    getListBooksBelongTo(id){
      return this.db.any(
        `SELECT 
        list_name,
        list_id
        FROM 
        booklists as b
        INNER JOIN booklist_books as bl
        on bl.booklist_id = b.list_id
        WHERE bl.book_id =$1`, [id]
      )
    }

    

}



module.exports = BooktonicaDatabase;
