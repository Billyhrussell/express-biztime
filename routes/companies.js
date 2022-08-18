const express = require("express");

const router = express.Router();

const db = require("../db");

const {BadRequestError, NotFoundError} = require('../expressError.js');

const slugify = require('slugify');

/**
 * Returns list of companies, {companies: [{code, name}, ...]}
 */

router.get("/", async function(req, res){
  const results = await db.query(`SELECT code, name FROM companies`);
  const companies = results.rows;

  return res.json({companies});
});

/**
 * Return obj of company:
 * {company: {code, name, description, invoices: [id, ...]}}
 */

router.get("/:code", async function(req,res){
  const code = req.params.code;

  const cResults = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]);
  const company = cResults.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);

  const iResults = await db.query(
    `SELECT i.id
      FROM invoices AS i
      JOIN companies AS c
      ON c.code = i.comp_code
      WHERE c.code = $1`, [code]);
  company.invoices = iResults.rows.map(i => i.id);

  return res.json({ company });
})

/**
 * given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */

router.post("/", async function (req, res) {
  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
    [code, name, description]);
  const company = results.rows[0];

  return res.status(201).json({ company });
});

/**
 * given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */

router.put('/:code', async function (req,res){
  if ("code" in req.body) throw new BadRequestError("Not allowed");

  const code = req.params.code;

  let { name, description } = req.body;

  name = slugify(name, {
    replacement: '-',
    lower: true
});

  const results = await db.query(
    `UPDATE companies
         SET name=$1, description = $2
         WHERE code = $3
         RETURNING name, description`,
    [name, description, code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company });
})

/**Deletes company,
 * Returns  {status: "deleted"}
 * */

router.delete('/:code', async function (req, res){
  const code = req.params.code;

  const results  = await db.query(
    `DELETE FROM companies WHERE code = $1 RETURNING name`,
    [code],
    );
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ message: "Deleted" });
})

module.exports = router;