const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;

const request = indexedDB.open("progressive-budget", 1);
// taking just the event (destructuring )
request.onupgradeneeded = ({ target }) => {
  let db = target.result;
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
  const transaction = db.transaction(["<object store name here>"], "readwrite");
  const store = transaction.objectStore("<object store name here>");
  store.add(record);
}
// creating a function for checkDatabase
function checkDatabase() {
  const transaction = db.transaction(["<object store name here>"], "readwrite");
  const store = transaction.objectStore("<object store name here>");
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
          const transaction = db.transaction(
            ["<object store name here>"],
            "readwrite"
          );
          const store = transaction.objectStore("<object store name here>");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
