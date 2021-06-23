const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;

const request = indexedDB.open("budget", 1);
// taking just the event (destructuring )
request.onupgradeneeded = ({ target }) => {
  db = target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
  db = target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Wrong! " + event.target.errorCode);
};
// creating a function for save record
function saveRecord(record) {
  const transaction = db.transaction(["budget"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}
// creating a function for checkDatabase and calling check database function
function checkDatabase() {
  const transaction = db.transaction(["budget"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  //get all on success
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          const transaction = db.transaction(["budget"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
