import { clearDB, clearCompanies, dropDB, initDB } from "../src/utils";
import app from "../src";
import request from "supertest";

describe("/api/companies", () => {
  beforeAll(async () => {
    await clearDB();
    await initDB();
  });

  afterEach(async () => {
    await clearCompanies();
  });

  afterAll(async () => {
    await clearDB();
    await dropDB();
  });

  it("should return an empty list on initial GET /api/companies", async () => {
    const { status, body } = await request(app).get("/api/companies").send();

    expect(status).toBe(200);
    expect(body).toEqual([]);
  });

  it("should return list with 1 user on POST /api/companies", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/companies")
      .send({
        name: "Sample Company",
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Company created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/companies/")
      .send();

    expect(getStatus).toBe(200);

    expect(getBody[0]).toMatchObject({
      name: "Sample Company",
      childCompanies: [],
      parentCompany: null,
    });
  });

  it("should return only requsted company and allow update of that company", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/companies")
      .send({
        name: "Sample Company",
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Company created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/companies/1")
      .send();

    expect(getStatus).toBe(200);
    expect(getBody).toMatchObject({
      name: "Sample Company",
      childCompanies: [],
      parentCompany: null,
    });

    const { status: putStatus } = await request(app)
      .put("/api/companies/1")
      .send({
        name: "Sample Company After Put",
      });

    expect(putStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/companies/1")
      .send();

    expect(getStatus).toBe(getStatusUpdated);
    expect(getBodyUpdated).toMatchObject({
      name: "Sample Company After Put",
      childCompanies: [],
      parentCompany: null,
    });
  });

  it("should add parent and child company", async () => {
    const { status: postStatus1, text: postText1 } = await request(app)
      .post("/api/companies")
      .send({
        name: "Sample Company",
      });

    expect(postStatus1).toBe(201);
    expect(postText1).toEqual("Company created");

    const { status: postStatus2, text: postText2 } = await request(app)
      .post("/api/companies")
      .send({
        name: "Sample Child Company",
        parentCompanyId: 1,
      });

    expect(postStatus2).toBe(201);
    expect(postText2).toEqual("Company created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/companies/")
      .send();

    expect(getStatus).toBe(200);
    expect(getBody.length).toEqual(2);
    expect(getBody[0]).toMatchObject({
      name: "Sample Child Company",
      childCompanies: [],
      parentCompany: {
        id: 1,
        name: "Sample Company",
      },
    });
  });

  it("should remove company from company list on delete", async () => {
    const { status: postStatus1, text: postText1 } = await request(app)
      .post("/api/companies")
      .send({
        name: "Sample Company",
      });

    expect(postStatus1).toBe(201);
    expect(postText1).toEqual("Company created");

    const { status: postStatus2, text: postText2 } = await request(app)
      .post("/api/companies")
      .send({
        name: "Sample Child Company",
        parentCompanyId: 1,
      });

    expect(postStatus2).toBe(201);
    expect(postText2).toEqual("Company created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/companies/")
      .send();

    expect(getStatus).toBe(200);
    expect(getBody.length).toEqual(2);

    const { status: deleteStatus } = await request(app)
      .delete("/api/companies/2")
      .send();

    expect(deleteStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/companies")
      .send();

    expect(getStatusUpdated).toBe(200);
    expect(getBodyUpdated.length).toEqual(1);
  });
});
