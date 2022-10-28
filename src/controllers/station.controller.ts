import { validate } from "class-validator";
import { Router, Response, Request } from "express";
import { commonConstants } from "../constants";
import { StationEntity } from "../entities";
import {
  StationRepository,
  StationTypeRepository,
  CompanyRepository,
} from "../repository";

export class StationController {
  public router: Router;
  private stationRepository: typeof StationRepository;
  private stationTypeRepository: typeof StationTypeRepository;
  private companyRepository: typeof CompanyRepository;

  constructor() {
    this.stationRepository = StationRepository;
    this.stationTypeRepository = StationTypeRepository;
    this.companyRepository = CompanyRepository;
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    try {
      const stations = await this.stationRepository.find({
        order: {
          id: "DESC",
          company: {
            id: "DESC",
          },
          stationType: {
            id: "DESC",
          },
        },
        relations: {
          company: true,
          stationType: true,
        },
      });
      return res.send(stations);
    } catch (error) {
      return res.status(500).send(commonConstants.internalServerError);
    }
  };

  public getOne = async (req: Request, res: Response) => {
    const id = req["params"]["id"];

    try {
      const station = await this.stationRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
        order: {
          id: "DESC",
          company: {
            id: "DESC",
          },
          stationType: {
            id: "DESC",
          },
        },
        relations: {
          company: true,
          stationType: true,
        },
      });
      return res.send(station);
    } catch (error) {
      return res.status(400).send("Not found");
    }
  };

  public create = async (req: Request, res: Response) => {
    const { name, companyId, stationTypeId } = req.body;
    const station = new StationEntity();

    let company;
    try {
      company = await this.companyRepository.findOneOrFail({
        where: {
          id: Number(companyId),
        },
      });
    } catch (error) {
      res.status(400).send("Provide valid id for company");
      return;
    }

    let stationType;
    try {
      stationType = await this.stationTypeRepository.findOneOrFail({
        where: {
          id: Number(stationTypeId),
        },
      });
    } catch (error) {
      res.status(400).send("Provide valid id for stationType");
      return;
    }

    station.name = name;
    station.company = company;
    station.stationType = stationType;

    const errors = await validate(station);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.stationRepository.save(station);
    } catch (error) {
      res.status(409).send("Station already exist");
      return;
    }

    res.status(201).send("Station created");
  };

  public update = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, companyId, stationTypeId } = req.body;

    let station;
    try {
      station = await this.stationRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("Station not found");
      return;
    }

    let company;
    try {
      company = await this.companyRepository.findOneOrFail({
        where: {
          id: Number(companyId),
        },
      });
    } catch (error) {
      res.status(400).send("Provide valid id for company");
      return;
    }

    let stationType;
    try {
      stationType = await this.stationTypeRepository.findOneOrFail({
        where: {
          id: Number(stationTypeId),
        },
      });
    } catch (error) {
      res.status(400).send("Provide valid id for stationType");
      return;
    }

    station.name = name;
    station.company = company;
    station.stationType = stationType;

    const errors = await validate(station);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.stationRepository.save(station);
    } catch (error) {
      res.status(400).send("Could not update company");
      return;
    }
    res.status(204).send();
  };

  public delete = async (req: Request, res: Response) => {
    const id = req.params.id;

    // Improvement- Before delete, check if the company has child(s)
    // If has, then reject, error 400

    try {
      await this.stationRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("Station not found");
      return;
    }
    this.stationRepository.delete(id);

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
