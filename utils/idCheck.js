import * as db from "../db/index.js";

export default async function idCheck(tableName, id) {
  const response = await db.query(`SELECT * FROM ${tableName} WHERE id = ${id}`);
  if (response.rows[0]) {
    return true;
  } else {
    return false;
  }
}