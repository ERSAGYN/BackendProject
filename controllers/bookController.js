const ExcelJS = require("exceljs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
//const nodemailer = require("nodemailer");
const logger = require("../utils/logger");
//
// const accessToken =
//   "vk1.a.PyNnoFrrVj2u-E-L75nZd0kbOm1aBX9YjHV5C5HP7PtJHI0BGtG9lFSh5IwSGUxJ2e2v8rf9UUObFihfO-Jf5wy0uO7p5mjxrXDblnaeyoChmOwvKMgPNNaj-ly3OTUMPmKKKyr8UPb1ZP5SOqqjWgI16zA0LDYwiZmHaLrzM0cuBRIsX3llnykbG8-afB2szalFiF4_8Ib7KslQEB_aUg\n";
// const userId = "457299835";
// const randomId = Math.floor(Math.random() * 1000000);

// const transporter = nodemailer.createTransport({
//   service: "outlook",
//   auth: {
//     user: "220642@astanait.edu.kz",
//     pass: "kLrk1ZRhMmZhm",
//   },
// });

async function getAllBooks(req, res) {
  try {
    logger.info(
      "/api/books",
      req.socket.remoteAddress,
      "Request receive(Get all books)",
    );
    const allBooks = await prisma.books.findMany();
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
  } finally {
    await prisma.$disconnect();
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

    const newBook = await prisma.books.create({
      data: {
        Name,
        Author,
        Genres,
        PagesCount,
        Price,
        PublishYear,
      },
    });

    // const mailOptions = {
    //   from: "220642@astanait.edu.kz",
    //   to: "ersagyn0@gmail.com",
    //   subject: "New Book Added",
    //   text: "A new book has been added to the library.",
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error("Email notification error:", error);
    //   } else {
    //     console.log("Email notification sent:", info.response);
    //   }
    // });

    // const message = "A new book has been added to the library.";
    // const vkApiUrl = `https://api.vk.com/method/messages.send?user_id=${userId}&message=${encodeURIComponent(message)}&access_token=${accessToken}&v=5.131&random_id=${randomId}`;
    //
    // const vkApiResponse = await fetch(vkApiUrl, { method: "POST" });
    // const vkApiResult = await vkApiResponse.json();

    // if (vkApiResult.error) {
    //   console.error("VK notification error:", vkApiResult.error);
    // } else {
    //   console.log("VK notification sent:", vkApiResult.response);
    // }

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
  } finally {
    await prisma.$disconnect();
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

      await prisma.books.create({ data });
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

    const updatedBook = await prisma.books.update({
      where: { id: bookId },
      data: {
        Name,
        Author,
        Genres,
        PagesCount,
        Price,
        PublishYear,
      },
    });

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
  } finally {
    await prisma.$disconnect();
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

    const existingBook = await prisma.books.findUnique({
      where: { id: bookId },
    });

    if (!existingBook) {
      return res.status(404).json({
        status: "fail",
        message: "Book not found",
      });
    }

    await prisma.books.delete({
      where: { id: bookId },
    });

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
  } finally {
    await prisma.$disconnect();
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

    // Query the database for the book with the specified name
    const book = await prisma.books.findFirst({
      where: { Name: bookName },
    });

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
  } finally {
    await prisma.$disconnect();
  }
}

async function getBookByPrice(req, res) {
  try {
    logger.info(
      "/api/books/byPrice/:price:",
      req.socket.remoteAddress,
      "Request receive(Get book by price)",
    );
    const bookPrice = parseFloat(req.params.price);

    // Query the database for the book with the specified name
    const book = await prisma.books.findFirst({
      where: { Price: bookPrice },
    });

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
  } finally {
    await prisma.$disconnect();
  }
}

async function getAuthors(req, res) {
  try {
    logger.info(
      "/api/authors",
      req.socket.remoteAddress,
      "Request receive(Get authors)",
    );
    const authors = await prisma.books.findMany({
      distinct: ["Author"],
      select: {
        Author: true,
      },
    });

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
  } finally {
    await prisma.$disconnect();
  }
}

async function getGenres(req, res) {
  try {
    logger.info(
      "/api/genres",
      req.socket.remoteAddress,
      "Request receive(Get genres)",
    );
    const books = await prisma.books.findMany();

    if (!books || books.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Books not found",
      });
    }

    const allGenres = books
      .flatMap((book) => book.Genres.replace(/\[|\]|'/g, "").split(", "))
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);

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
  } finally {
    await prisma.$disconnect();
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

    const booksByAuthor = await prisma.books.findMany({
      where: {
        Author: authorName,
      },
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
  } finally {
    await prisma.$disconnect();
  }
}

async function getBooksByGenre(req, res) {
  try {
    logger.info(
      "/api/genres/:genre/books",
      req.socket.remoteAddress,
      "Request receive(Get all books by one genre)",
    );
    // Extract the genre from the parameters
    const genre = req.params.genre;

    // Query the database for books with the specified genre
    const booksByGenre = await prisma.books.findMany({
      where: {
        Genres: {
          contains: genre,
        },
      },
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
  } finally {
    await prisma.$disconnect();
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
