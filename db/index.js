import { Pool } from "pg";

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'anthony',
    database: 'e_commerce'
});

export const query = (text, params) => {
    return pool.query(text, params)
};
