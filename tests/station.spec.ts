import {
  initDBWithData,
  createInitialCompany,
  createInitialStationType,
  clearDB,
  clearStations,
  dropDB,
} from "../src/utils";
import app from "../src";
import request from "supertest";

describe("/api/stations", () => {
  beforeAll(async () => {
    await clearDB();
    await initDBWithData();
    await createInitialCompany();
    await createInitialStationType();
  });

  afterEach(async () => {
    await clearStations();
  });

  afterAll(async () => {
    await clearDB();
    await dropDB();
  });

  it("should return an empty list on initial GET /api/stations", async () => {
    const { status, body } = await request(app).get("/api/stations").send();

    expect(status).toBe(200);
    expect(body).toEqual([]);
  });

  it("should return list with 1 user on POST /api/stations", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/stations")
      .send({
        name: "Sample Station",
        companyId: 1,
        stationTypeId: 1,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Station created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/stations/")
      .send();

    expect(getStatus).toBe(200);

    expect(getBody[0]).toMatchObject({
      name: "Sample Station",
      company: {
        name: "Initial Company Test",
      },
      stationType: {
        name: "Initial Station Type Test",
      },
    });
  });

  it("should return only requsted company and allow update of that company", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/stations")
      .send({
        name: "Sample Station",
        companyId: 1,
        stationTypeId: 1,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Station created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/stations/1")
      .send();

    expect(getStatus).toBe(200);
    expect(getBody).toMatchObject({
      name: "Sample Station",
      company: {
        name: "Initial Company Test",
      },
      stationType: {
        name: "Initial Station Type Test",
      },
    });

    const { status: putStatus } = await request(app)
      .put("/api/stations/1")
      .send({
        name: "Sample Station Update",
        companyId: 1,
        stationTypeId: 1,
      });

    expect(putStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/stations/1")
      .send();

    expect(getStatus).toBe(getStatusUpdated);
    expect(getBodyUpdated).toMatchObject({
      name: "Sample Station Update",
    });
  });

  it("should remove station from station list on delete", async () => {
    const { status: postStatus1, text: postText1 } = await request(app)
      .post("/api/stations")
      .send({
        name: "Sample Station 1",
        companyId: 1,
        stationTypeId: 1,
      });

    expect(postStatus1).toBe(201);
    expect(postText1).toEqual("Station created");

    const { status: postStatus2, text: postText2 } = await request(app)
      .post("/api/stations")
      .send({
        name: "Sample Station 2",
        companyId: 1,
        stationTypeId: 1,
      });

    expect(postStatus2).toBe(201);
    expect(postText2).toEqual("Station created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/stations/")
      .send();

    expect(getStatus).toBe(200);
    expect(getBody.length).toEqual(2);

    const { status: deleteStatus } = await request(app)
      .delete("/api/stations/2")
      .send();

    expect(deleteStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/stations")
      .send();

    expect(getStatusUpdated).toBe(200);
    expect(getBodyUpdated.length).toEqual(1);
  });
});
