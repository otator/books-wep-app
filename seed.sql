DROP TABLE IF EXISTS books;

CREATE TABLE books(
    id SERIAL PRIMARY KEY,
    img_url VARCHAR(255),
    title VARCHAR(255),
    author VARCHAR(255),
    descriptions TEXT,
    isbn VARCHAR(255),
    bookShelf VARCHAR(255)
);