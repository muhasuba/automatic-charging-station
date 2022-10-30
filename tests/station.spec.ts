import * as utils from "../src/utils";
import app from "../src";
import request from "supertest";

describe("/api/stations", () => {
  beforeAll(async () => {
    await utils.clearDB();
    await utils.initDBWithData();
    await utils.clearStations();
  });

  afterEach(async () => {
    await utils.clearStations();
  });

  afterAll(async () => {
    await utils.clearDB();
    await utils.dropDB();
  });

  it("should return initial list of stations GET /api/stations", async () => {
    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/stations/")
      .send();

    expect(getStatus).toBe(200);
    expect(getBody.length).toEqual(0);
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
        name: "Company 1",
      },
      stationType: {
        name: "Station Type 1",
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
        name: "Company 1",
      },
      stationType: {
        name: "Station Type 1",
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

    const { status: deleteStatusFailed } = await request(app)
      .delete("/api/stations/2")
      .send();

    expect(deleteStatusFailed).toBe(404);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/stations")
      .send();

    expect(getStatusUpdated).toBe(200);
    expect(getBodyUpdated.length).toEqual(1);
  });
});
