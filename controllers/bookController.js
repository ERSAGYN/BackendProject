const ExcelJS = require("exceljs");

const Book = require("../models/book");

const logger = require("../utils/logger");

async function getAllBooks(req, res) {
  try {
    logger.info(
      "/api/books",
      req.socket.remoteAddress,
      "Request receive(Get all books)",
    );
    const allBooks = await Book.find();
    res.status(200).json({
      status: "success",
      results: allBooks.length,
      data: {
        books: allBooks,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

async function setNewBook(req, res) {
  try {
    logger.info(
      "/api/books",
      req.socket.remoteAddress,
      "Request receive(Set new book)",
    );
    const { Name, Author, Genres, PagesCount, Price, PublishYear } = req.body;

    const newBook = await Book.create({
      Name,
      Author,
      Genres,
      PagesCount,
      Price,
      PublishYear,
    });

    res.status(201).json({
      status: "success",
      data: {
        book: newBook,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

async function uploadBook(req, res) {
  try {
    logger.info(
      "/upload-excel",
      req.socket.remoteAddress,
      "Request receive(Uploaded books from excel)",
    );
    const { file } = req;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.worksheets[0];

    console.log("Worksheet:", worksheet);
    console.log("Columns:", worksheet.columns);
    console.log("RowCount:", worksheet.rowCount);

    const rows = worksheet.getSheetValues();

    console.log("Rows:", rows);

    const headers = rows[1];

    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      const data = {};

      for (let j = 2; j < headers.length; j++) {
        if (headers[j] === "Name") data[headers[j]] = String(row[j]);
        else data[headers[j]] = row[j];
      }

      await Book.create(data);
    }
    res.json({
      message: "Excel file uploaded and data inserted successfully",
    });
  } catch (error) {
    console.error("Error uploading Excel file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateBook(req, res) {
  try {
    logger.info(
      "/api/books/:id",
      req.socket.remoteAddress,
      "Request receive(Updated book)",
    );

    const bookId = parseInt(req.params.id, 10);
    const { Name, Author, Genres, PagesCount, Price, PublishYear } = req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        Name,
        Author,
        Genres,
        PagesCount,
        Price,
        PublishYear,
      },
      { new: true },
    );

    res.status(200).json({
      status: "success",
      data: {
        book: updatedBook,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

async function deleteBook(req, res) {
  try {
    logger.info(
      "/api/books/:id",
      req.socket.remoteAddress,
      "Request receive(Deleted book)",
    );

    const bookId = parseInt(req.params.id, 10);

    const existingBook = await Book.findById(bookId);

    if (!existingBook) {
      return res.status(404).json({
        status: "fail",
        message: "Book not found",
      });
    }

    await Book.findByIdAndDelete(bookId);

    res.status(200).json({
      status: "success",
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

async function getBookByName(req, res) {
  try {
    logger.info(
      "/api/books/byName/:name",
      req.socket.remoteAddress,
      "Request receive(Get book by name)",
    );

    const bookName = req.params.name;

    const book = await Book.findOne({ Name: bookName });

    if (!book) {
      return res.status(404).json({
        status: "fail",
        message: "Book not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        book,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

async function getBookByPrice(req, res) {
  try {
    logger.info(
      "/api/books/byPrice/:price",
      req.socket.remoteAddress,
      "Request receive(Get book by price)",
    );

    const bookPrice = parseFloat(req.params.price);

    const book = await Book.findOne({ Price: bookPrice });

    if (!book) {
      return res.status(404).json({
        status: "fail",
        message: "Book not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        book,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

async function getAuthors(req, res) {
  try {
    logger.info(
      "/api/authors",
      req.socket.remoteAddress,
      "Request receive(Get authors)",
    );

    const authors = await Book.find().distinct("Author");

    if (!authors || authors.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Authors not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        authors,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

async function getGenres(req, res) {
  try {
    logger.info(
      "/api/genres",
      req.socket.remoteAddress,
      "Request receive(Get genres)",
    );

    const books = await Book.find();

    if (!books || books.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Books not found",
      });
    }

    const allGenres = Array.from(new Set(books.flatMap((book) => book.Genres)));

    res.status(200).json({
      status: "success",
      data: {
        genres: allGenres,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

async function getBooksByAuthor(req, res) {
  try {
    logger.info(
      "/api/authors/:name/books",
      req.socket.remoteAddress,
      "Request receive(Get books by one Author)",
    );

    const authorName = req.params.name;

    const booksByAuthor = await Book.find({
      Author: authorName,
    });

    if (!booksByAuthor || booksByAuthor.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: `Books by the author ${authorName} not found`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        books: booksByAuthor,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

async function getBooksByGenre(req, res) {
  try {
    logger.info(
      "/api/genres/:genre/books",
      req.socket.remoteAddress,
      "Request receive(Get all books by one genre)",
    );

    const genre = req.params.genre;

    const booksByGenre = await Book.find({
      Genres: { $regex: new RegExp(genre), $options: "i" },
    });

    if (!booksByGenre || booksByGenre.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: `Books with the specified genre not found`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        books: booksByGenre,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  getAllBooks,
  uploadBook,
  setNewBook,
  updateBook,
  deleteBook,
  getBookByName,
  getBookByPrice,
  getAuthors,
  getGenres,
  getBooksByAuthor,
  getBooksByGenre,
};
