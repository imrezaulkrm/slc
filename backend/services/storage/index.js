const localStorage = require("./local.storage");
const driveStorage = require("./drive.storage");

let activeStorage = "local"; // "drive" later

module.exports = {
  getStorage() {
    if (activeStorage === "local") return localStorage;
    if (activeStorage === "drive") return driveStorage;
  },
  setStorage(storageName) {
    activeStorage = storageName;
  }
};

