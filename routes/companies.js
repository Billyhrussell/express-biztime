const express = require("express");

const router = express.Router();

const db = require("../db");

/**
 * Returns list of companies, {companies: [{code, name}, ...]}
 */
router.get("/", async function(req, res){
  const results = await db.query(`SELECT code, name FROM companies`);
  const companies = results.rows;

  return res.json({companies});
});

/**
 * Return obj of company: {company: {code, name, description}}
 */
router.get("/:code", async function(req,res){
  const code = req.params.code;

  const results = await db.query(
    "SELECT code, name, description FROM companies WHERE code = $1", [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company });
})
/**
 * given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */
router.post("/", async function (req, res) {
  const results = await db.query(
    `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
    [req.body.code, req.body.name, req.body.description]);
  const company = results.rows[0];

  return res.status(201).json({ company });
});


router.put('/:code', async function (req,res){
  // if ("id" in req.body) throw new BadRequestError("Not allowed");

  const code = req.params.code;
  const results = await db.query(
    `UPDATE companies
         SET name=$1, description = $2
         WHERE code = $3
         RETURNING name, description`,
    [req.body.name, req.body.description, code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company });
})

module.exports = router;