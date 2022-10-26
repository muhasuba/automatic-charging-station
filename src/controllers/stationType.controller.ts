import { validate } from "class-validator";
import { Router, Response, Request } from "express";
import { commonConstants } from "../constants";
import { StationTypeEntity } from "../entities";
import { StationTypeRepository } from "../repository";

export class StationTypeController {
  public router: Router;
  private StationTypeRepository: typeof StationTypeRepository;

  constructor() {
    this.StationTypeRepository = StationTypeRepository;
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    try {
      const companies = await this.StationTypeRepository.find({
        order: {
          id: "DESC",
        },
      });
      return res.send(companies);
    } catch (error) {
      return res.status(500).send(commonConstants.internalServerError);
    }
  };

  public getOne = async (req: Request, res: Response) => {
    const id = req["params"]["id"];

    try {
      const stationType = await this.StationTypeRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
        order: {
          id: "DESC",
        },
      });
      return res.send(stationType);
    } catch (error) {
      return res.status(400).send("Not found");
    }
  };

  public create = async (req: Request, res: Response) => {
    const { name, maxPower } = req.body;
    const stationType = new StationTypeEntity();

    stationType.name = name;
    stationType.maxPower = maxPower;

    const errors = await validate(stationType);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.StationTypeRepository.save(stationType);
    } catch (e) {
      res.status(409).send("Station type already exist");
      return;
    }

    res.status(201).send("Station type created");
  };

  public update = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, maxPower } = req.body;

    let stationType;
    try {
      stationType = await this.StationTypeRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("Station type not found");
      return;
    }

    stationType.name = name;
    stationType.maxPower = maxPower;

    const errors = await validate(stationType);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.StationTypeRepository.save(stationType);
    } catch (e) {
      res.status(400).send("Could not update station type");
      return;
    }
    res.status(204).send();
  };

  public delete = async (req: Request, res: Response) => {
    const id = req.params.id;

    // Improvement- Before delete, check if the station type has used by station
    // If has, then reject, error 400

    try {
      await this.StationTypeRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("Station type not found");
      return;
    }
    this.StationTypeRepository.delete(id);

    res.status(204).send();
  };

  public routes() {
    this.router.get("/", this.index);
    this.router.get("/:id", this.getOne);
    this.router.post("/", this.create);
    this.router.put("/:id", this.update);
    this.router.delete("/:id", this.delete);
  }
}
