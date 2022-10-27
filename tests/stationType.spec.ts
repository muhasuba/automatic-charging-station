import { clearDB, clearStationTypes, dropDB, initDB } from "../src/utils";
import app from "../src";
import request from "supertest";

describe("/api/station-types", () => {
  beforeAll(async () => {
    await clearDB();
    await initDB();
  });

  afterEach(async () => {
    await clearStationTypes();
  });

  afterAll(async () => {
    await clearDB();
    await dropDB();
  });

  it("should return an empty list on initial GET /api/station-types", async () => {
    const { status, body } = await request(app)
      .get("/api/station-types")
      .send();

    expect(status).toBe(200);
    expect(body).toEqual([]);
  });

  it("should return list with 1 user on POST /api/station-types", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/station-types")
      .send({
        name: "Sample Station Type",
        maxPower: 100,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Station type created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/station-types/")
      .send();

    expect(getStatus).toBe(200);

    expect(getBody[0]).toMatchObject({
      name: "Sample Station Type",
      maxPower: 100,
    });
  });

  it("should return only requsted company and allow update of that company", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/station-types")
      .send({
        name: "Sample Station Type",
        maxPower: 100,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Station type created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/station-types/1")
      .send();

    expect(getStatus).toBe(200);
    expect(getBody).toMatchObject({
      name: "Sample Station Type",
      maxPower: 100,
    });

    const { status: putStatus } = await request(app)
      .put("/api/station-types/1")
      .send({
        name: "Sample Station Type After Put",
        maxPower: 99,
      });

    expect(putStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/station-types/1")
      .send();

    expect(getStatus).toBe(getStatusUpdated);
    expect(getBodyUpdated).toMatchObject({
      name: "Sample Station Type After Put",
      maxPower: 99,
    });
  });

  it("should reject if similar station type already exist", async () => {
    const { status: postStatus1, text: postText1 } = await request(app)
      .post("/api/station-types")
      .send({
        name: "Sample Station Type",
        maxPower: 100,
      });

    expect(postStatus1).toBe(201);
    expect(postText1).toEqual("Station type created");

    const { status: postStatus2, text: postText2 } = await request(app)
      .post("/api/station-types")
      .send({
        name: "Sample Station Type",
        maxPower: 100,
      });

    expect(postStatus2).toBe(409);
    expect(postText2).toEqual("Station type already exist");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/station-types/")
      .send();

    expect(getStatus).toBe(200);
    expect(getBody.length).toEqual(1);
  });

  it("should remove station type from station type list on delete", async () => {
    const { status: postStatus1, text: postText1 } = await request(app)
      .post("/api/station-types")
      .send({
        name: "Sample Station Type",
        maxPower: 100,
      });

    expect(postStatus1).toBe(201);
    expect(postText1).toEqual("Station type created");

    const { status: postStatus2, text: postText2 } = await request(app)
      .post("/api/station-types")
      .send({
        name: "Another Sample Station Type",
        maxPower: 111,
      });

    expect(postStatus2).toBe(201);
    expect(postText2).toEqual("Station type created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/station-types/")
      .send();

    expect(getStatus).toBe(200);
    expect(getBody.length).toEqual(2);

    const { status: deleteStatus } = await request(app)
      .delete("/api/station-types/2")
      .send();

    expect(deleteStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/station-types")
      .send();

    expect(getStatusUpdated).toBe(200);
    expect(getBodyUpdated.length).toEqual(1);
  });
});
