// import { validate } from "class-validator";
import { Router, Response, Request } from "express";
// import { commonConstants } from "../constants";
// import { DestinationEntity } from "../entities";
// import { checkAuth, checkRole } from "../middleware";
// import { DestinationRepository } from "../repository";

export class ScriptController {
  public router: Router;
  // private destinationRepository: typeof DestinationRepository;

  constructor() {
    // this.destinationRepository = DestinationRepository;
    this.router = Router();
    this.routes();
  }

  public parser = async (req: Request, res: Response) => {
    const { separator, script } = req.body;
    console.log("body", JSON.stringify(req.body));

    const listScript = script.toLowerCase().split("\n");

    if (
      listScript[0] != "begin" ||
      listScript[listScript.length - 1] != "end"
    ) {
      res.status(400).send("Invalid script");
      return;
    }

    // destination.name = name;
    // destination.state = state;
    // destination.city = city;
    // destination.cost = cost;
    // destination.maxGuests = maxGuests;

    // if (typeof available === "boolean") destination.available = available;
    // if (typeof description === "string") destination.description = description;

    // const errors = await validate(destination);
    // if (errors.length > 0) {
    //   res.status(400).send(errors);
    //   return;
    // }

    // try {
    //   await this.destinationRepository.save(destination);
    // } catch (e) {
    //   res.status(409).send("Destination already exist");
    //   return;
    // }

    res.status(200).json({
      status: "success",
      results: "xx",
      separator,
      script,
    });
  };

  public routes() {
    // this.router.use([checkAuth, checkRole(["ADMIN"])]);
    this.router.post("/parser", this.parser);
  }
}
