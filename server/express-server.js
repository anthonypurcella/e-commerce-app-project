import express from 'express'
const app = express()
const port = 3000
import * as db from '../db/index.js'

app.get('/:id', async (req,res) => {
    const response = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.send(response.rows);
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});