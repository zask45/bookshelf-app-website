const STORAGE_KEY = 'BOOK_DATA';
const STORAGE_KEY_FOR_SEARCH = 'SEARCHED_BOOK_DATA';
const RENDER_ITEM = 'render-book';
const RENDER_SEARCHED_ITEM = 'render-searched-book';

const generateId = () => {
  return +new Date();
}

const generateBookItem = (id, title, author, year, isComplete) => {
  return {
    id, 
    title,
    author,
    year,
    isComplete
  }
}

const isStorageExist = () => {
  if (typeof (Storage) !== undefined) return true;
  
  alert('Browser anda tidak mendukung Local Storage');
  return false;
}

const getDataFromStorage = () => {
  const bookList = [];
  const storageData = localStorage.getItem(STORAGE_KEY);
  const books = JSON.parse(storageData);
  if (books !== null) {
    for (const book of books) {
      bookList.push(book);
    }
  }
  return bookList;
}

const addStorageData = (book) => {
  if (isStorageExist()) {
    const newBook = book;
    const bookList = getDataFromStorage();
    bookList.push(newBook);
    const formatedBookData = JSON.stringify(bookList);
    localStorage.setItem(STORAGE_KEY, formatedBookData);
  }
}

const saveFormData = () => {
  const idNum = generateId();
  const bookTitle = document.getElementById('bookTitleInput').value;
  const bookAuthor = document.getElementById('bookAuthorInput').value;
  const bookYear = document.getElementById('bookYearInput').value;
  let bookIsComplete = document.getElementById('bookIsAlreadyReadInput');
  if (bookIsComplete.checked === true) {
    bookIsComplete = true;
  } else {
    bookIsComplete = false;
  }
  const book = generateBookItem(idNum, bookTitle, bookAuthor, bookYear, bookIsComplete);
  addStorageData(book);
}

const findBookIndex = (id) => {
  const bookList = getDataFromStorage();
  for (const i in bookList) {
    if (bookList[i].id === id) {
      return i;
    }
  }
  return -1;
}

const findBook = (id) => {
const bookList = getDataFromStorage();
  for (book of bookList) {
    if (book.id === id) return book;
  }
  return -1;
}

const saveSearchedBookToStorage = (title) => {
  if (isStorageExist()) {
    localStorage.removeItem(STORAGE_KEY_FOR_SEARCH);
    const bookList = getDataFromStorage();
    const searchedBookList = [];
  
    for (book of bookList) {
      if (book.title === title) {
        searchedBookList.push(book);
      }
    }
  
    const searchedBook = JSON.stringify(searchedBookList);
    sessionStorage.setItem(STORAGE_KEY_FOR_SEARCH, searchedBook);

    document.dispatchEvent(new Event(RENDER_SEARCHED_ITEM));
  }
}

const getSearchedBookFromStorage = () => {
  const storageData = sessionStorage.getItem(STORAGE_KEY_FOR_SEARCH);
  const books = JSON.parse(storageData);
  const searchedBookList = [];

  if (books !== null) {
    for (const book of books) searchedBookList.push(book);
  }

  return searchedBookList;

}

const moveBookToUncompleteList = (id) => {
  const book = findBook(id);
  if (book !== -1) {
    book.isComplete = false;
    deleteBookItem(id);
    addStorageData(book);
    document.dispatchEvent(new Event(RENDER_ITEM));
  }
}

const moveBookToCompleteList = (id) => {
  const book = findBook(id);
  if (book !== -1) {
    book.isComplete = true;
    deleteBookItem(id);
    addStorageData(book);
    document.dispatchEvent(new Event(RENDER_ITEM));
  }
}

const deleteBookItem = (id) => {
  const index = findBookIndex(id);
  if (index !== -1) {
    const bookList = getDataFromStorage();
    bookList.splice(index, 1);
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookList));
    document.dispatchEvent(new Event(RENDER_ITEM));
  }
}

const changeButtonBackground = (event, button, address) => {
  button.addEventListener(event, () => {
    button.style.backgroundImage = address;
  });
}

const makePopUpDialog = (id) => {
  const popUp = document.getElementById('popup');
  popUp.style.display = 'block';
  const deleteButton = document.getElementById('delete-button');
  deleteButton.addEventListener('click', () => {

    deleteBookItem(id);
    popUp.style.display = 'none';
    
  });
  const exitButton = document.getElementById('exit-button');
  exitButton.addEventListener('click', () => {
    popUp.style.display = 'none';
  });
  
}

const makeBookListItem = (book) => {
  const {id, title, author, year, isComplete} = book;
  const itemTitle = document.createElement('h3');
  itemTitle.textContent = title;
  const additionalInfo = document.createElement('p');
  additionalInfo.textContent = `${author}, ${year}`;

  const card = document.createElement('article');
  card.append(itemTitle, additionalInfo);
  card.classList.add('card', 'book-item');
  card.setAttribute('id', `${id}`);

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-button');
  deleteButton.classList.add('delete');
  deleteButton.addEventListener('click', (event) => {
    event.preventDefault();
    makePopUpDialog(id);
  });

  if (isComplete === true) {
    const completeButton = document.createElement('button');
    completeButton.classList.add('complete-button');
    completeButton.style.backgroundImage = "url('assets/img/check-button-blue.svg')";
    changeButtonBackground('mouseover', completeButton, "url('assets/img/check-button-blue-blank.svg')");
    changeButtonBackground('mouseleave', completeButton, "url('assets/img/check-button-blue.svg')");
    changeButtonBackground('click', completeButton, "url('assets/img/check-button-blue.svg')");

    completeButton.addEventListener('click', () => {
      moveBookToUncompleteList(id);
    });

    card.append(completeButton, deleteButton);

    return card;
  } 

  const completeButton = document.createElement('button');
  completeButton.classList.add('complete-button');
  completeButton.addEventListener('click', () => {
    moveBookToCompleteList(id);
  });

  card.append(completeButton, deleteButton);

  return card;
}

document.addEventListener('DOMContentLoaded', () => {
  document.dispatchEvent(new Event(RENDER_ITEM));

  const form = document.getElementById('input-book');
  form.addEventListener('submit', () => {
    saveFormData();
  });

  const searchedTitle = document.getElementById('bookTitleSearch');
  searchedTitle.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveSearchedBookToStorage(searchedTitle.value);

    }
  });

  const searchButton = document.getElementById('search-button');
  searchButton.addEventListener('click', (event) => {
    event.preventDefault();
    saveSearchedBookToStorage(searchedTitle.value);
  });
});


document.addEventListener(RENDER_ITEM, () => {
  const unCompletedList = document.getElementById('bookIsNotReadList');
  const completedList = document.getElementById('bookIsReadList');
  const popUp = document.getElementById('popup');
  unCompletedList.innerHTML = '';
  completedList.innerHTML = '';
  popUp.style.display = 'none';

  const bookList = getDataFromStorage();
  for (book of bookList) {
    const card = makeBookListItem(book);
    if (book.isComplete === false) {
      unCompletedList.append(card);
    } else {
      completedList.append(card);
    }
  }
});

document.addEventListener(RENDER_SEARCHED_ITEM, () => {
  const unCompletedList = document.getElementById('bookIsNotReadList');
  const completedList = document.getElementById('bookIsReadList');
  const popUp = document.getElementById('popup');
  unCompletedList.innerHTML = '';
  completedList.innerHTML = '';
  popUp.style.display = 'none';

  const searchedBooks = getSearchedBookFromStorage();
    for (book of searchedBooks) {
      const card = makeBookListItem(book);
      if (book.isComplete === false) {
        unCompletedList.append(card);
      } else {
        completedList.append(card);
      }
    }
});
