import { validate } from "class-validator";
import { Router, Response, Request } from "express";
import { commonConstants } from "../constants";
import { CompanyEntity } from "../entities";
import { CompanyRepository } from "../repository";

export class CompanyController {
  public router: Router;
  private companyRepository: typeof CompanyRepository;

  constructor() {
    this.companyRepository = CompanyRepository;
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    try {
      const companies = await this.companyRepository.find({
        order: {
          id: "DESC",
          childCompanies: {
            id: "DESC",
          },
        },
        relations: {
          childCompanies: true,
          parentCompany: true,
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
      const company = await this.companyRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
        order: {
          id: "DESC",
          childCompanies: {
            id: "DESC",
          },
        },
        relations: {
          childCompanies: true,
          parentCompany: true,
        },
      });
      return res.send(company);
    } catch (error) {
      return res.status(400).send("Not found");
    }
  };

  public create = async (req: Request, res: Response) => {
    const { name, parentCompanyId } = req.body;
    const company = new CompanyEntity();

    let parentCompany;
    if (parentCompanyId) {
      try {
        parentCompany = await this.companyRepository.findOneOrFail({
          where: {
            id: Number(parentCompanyId),
          },
        });
      } catch (error) {
        res.status(400).send("Provide valid id for parent company");
        return;
      }
    }

    company.name = name;
    company.parentCompany = parentCompany;

    const errors = await validate(company);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.companyRepository.save(company);
    } catch (error) {
      res.status(409).send("Company already exist");
      return;
    }

    res.status(201).send("Company created");
  };

  public update = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, parentCompanyId } = req.body;

    if (parseInt(id, 10) === parseInt(parentCompanyId, 10)) {
      res.status(400).send("Parent company id cannot be equal company id");
      return;
    }
    let company;
    try {
      company = await this.companyRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("Company not found");
      return;
    }

    let parentCompany;
    if (parentCompanyId) {
      try {
        parentCompany = await this.companyRepository.findOneOrFail({
          where: {
            id: Number(parentCompanyId),
          },
        });
      } catch (error) {
        res.status(400).send("Provide valid id for parent company");
        return;
      }
    }

    company.name = name;
    company.parentCompany = parentCompany;

    const errors = await validate(company);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.companyRepository.save(company);
    } catch (error) {
      res.status(400).send("Could not update company");
      return;
    }
    res.status(204).send();
  };

  public delete = async (req: Request, res: Response) => {
    const id = req.params.id;

    // Next improvement- Before delete, check if the company has child(s)
    // If has, then reject, error 400

    try {
      await this.companyRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("Company not found");
      return;
    }
    this.companyRepository.delete(id);

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
