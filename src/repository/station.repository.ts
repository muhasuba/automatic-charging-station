import { StationEntity } from "../entities";
import { DB } from "../utils";

export const StationRepository = DB.getRepository(StationEntity).extend({});
