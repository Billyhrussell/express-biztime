const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testBiztime;

beforeEach(async function(){
  let result = await db.query(`INSERT INTO companies (code, name, description)
                  VALUES ('apple', 'apple computer', 'fast')
                  RETURNING code, name`);

  testBiztime = result.rows[0];
})

afterEach(async function(){
  await db.query(`DELETE FROM companies`);
})

describe("GET /companies", function(){
  test("get a list of all companies", async function(){
    const resp = await request(app).get(`/companies`);
    console.log(resp);
    expect(resp.body).toEqual({
      companies: [testBiztime]
    });
  });
});

describe("GET /apple", function(){
  test("test getting one company", async function(){
    const resp = await request(app).get(`/companies/apple`);

    expect(resp.body).toEqual({
      company: {
        "code": "apple",
        "name": "apple computer",
        "description": "fast",
        "invoices": []
      }
    });
  });
});

describe("POST /companies", function(){
  test("adding a company", async function(){
    const resp = await request(app).post(`/companies`)
      .send({code:"google", name: "home", description:"hi"});


    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({company:{"code": "google", "name":"home",
      "description": "hi"},
    });
})

});