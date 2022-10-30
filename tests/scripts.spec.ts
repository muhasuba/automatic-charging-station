import * as utils from "../src/utils";
import app from "../src";
import request from "supertest";
import sampleResultScriptParser from "./data/sampleResultScriptParser";

describe("/api/scripts", () => {
  beforeAll(async () => {
    await utils.clearDB();
    await utils.initDBWithData();
  });

  afterEach(async () => {
    await utils.clearCompanies();
  });

  afterAll(async () => {
    await utils.clearDB();
    await utils.dropDB();
  });

  it("should return valid results for sample valid request", async () => {
    jest.spyOn(utils, "getUnixTimestamp").mockReturnValueOnce(1667141279);

    const { status: postStatus, body: getBody } = await request(app)
      .post("/api/scripts/parser")
      .send({
        separator: "\n",
        script:
          "Begin\nStart station 1\nWait 5\nStart station 2\nWait 10\nStart station all\nWait 10\nStop station 2\nWait 10\nStop station 3\nWait 5\nStop station all\nEnd",
      });

    expect(postStatus).toBe(200);
    expect(getBody).toMatchObject(sampleResultScriptParser);
  });

  it("should return error invalid input request", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/scripts/parser")
      .send({
        separator: "\n",
        script:
          "Beginx\nStart station 1\nWait 5\nStart station 2\nWait 10\nStart station all",
      });

    expect(postStatus).toBe(400);
    expect(postText).toEqual("Invalid input script");
  });
});
