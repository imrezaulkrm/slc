const sheetService = require("./sheet.service");
const postgresService = require("./postgres.service");

let activeDB = "sheet"; // "postgres" later

module.exports = {
  getDB() {
    if (activeDB === "sheet") return sheetService;
    if (activeDB === "postgres") return postgresService;
  },
  setDB(dbName) {
    activeDB = dbName;
  }
};
