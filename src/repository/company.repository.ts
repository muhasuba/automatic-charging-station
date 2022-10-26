import { CompanyEntity } from "../entities";
import { DB } from "../utils";

export const CompanyRepository = DB.getRepository(CompanyEntity).extend({});
