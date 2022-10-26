import { StationTypeEntity } from "../entities";
import { DB } from "../utils";

export const StationTypeRepository = DB.getRepository(StationTypeEntity).extend(
  {}
);
