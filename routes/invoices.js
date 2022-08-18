const express = require("express");

const router = express.Router();

const db = require("../db");

const {BadRequestError, NotFoundError} = require('../expressError.js')

/**
 * Returns info on invoices: {invoices: [{id, comp_code}, ...]}
 */

 router.get("/", async function(req, res){
  const results = await db.query(`SELECT id, comp_code name FROM invoices`);
  const invoices = results.rows;

  return res.json({invoices});
});

/**
 * Returns {invoice: {id, amt, paid, add_date, paid_date,
 *  company: {code, name, description}}
 */
 router.get("/:id", async function(req,res){
  const id = req.params.id;

  const results = await db.query(
    `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date
     FROM invoices AS i
     WHERE id = $1`, [id]);

  const invoices = results.rows[0];

  const cResults = await db.query(
    `SELECT c.code, c.name, c.description
    FROM companies AS c
    JOIN invoices AS i
    ON i.comp_code = c.code
    WHERE i.id = $1`, [id]);

    const company = cResults.rows[0];
    invoices.company = company;

  if (!invoices) throw new NotFoundError(`No matching company: ${id}`);
  return res.json({ invoices });
})

/**
 * passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async function(req, res){
  const {comp_code, amt} = req.body;

  const results = await db.query(
    `INSERT INTO invoices(comp_code, amt)
         VALUES ($1, $2)
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]);

  const invoice = results.rows[0];

  return res.status(201).json({ invoice });
})


module.exports = router;