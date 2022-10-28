import { Router, Response, Request } from "express";
import { commonConstants } from "../constants";
import { CompanyEntity, StationEntity } from "../entities";
import { DB, getUnixTimestamp } from "../utils";

interface CompanyObject {
  id: number;
  chargingStations: number[];
  chargingPower: number;
}

interface DataObject {
  step: string;
  timestamp: number;
  companies: CompanyObject[];
  totalChargingStations: number[];
  totalChargingPower: number;
}

const processStartStation = async (
  stationInfo: string,
  companies: CompanyObject[],
  totalChargingStations: number[],
  totalChargingPower: number,
  companiesHash: Object
) => {
  if (stationInfo === "all") {
    const stations = []; //get all stations
  } else {
    const stationId = Number(stationInfo);
    const station = await DB.getRepository(StationEntity).findOneOrFail({
      where: {
        id: Number(stationId),
      },
      relations: {
        company: true,
        stationType: true,
      },
    });
    console.log(`station ${JSON.stringify(station)}`);
    const company = await DB.getRepository(CompanyEntity).findOneOrFail({
      where: {
        id: Number(station.company.id),
      },
      relations: {
        parentCompany: true,
      },
    });
    console.log(`company ${JSON.stringify(company)}`);
  }
};

export class ScriptController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  public parser = async (req: Request, res: Response) => {
    const { script } = req.body;
    let { separator } = req.body;
    console.log("body", JSON.stringify(req.body));

    if (!separator) {
      separator = "\n";
    }

    try {
      const listCommands = script.toLowerCase().split(separator);

      if (
        listCommands[0] != "begin" ||
        listCommands[listCommands.length - 1] != "end"
      ) {
        res.status(400).send("Invalid script");
        return;
      }

      const data: DataObject[] = [];
      const companies: CompanyObject[] = [];
      const totalChargingStations: number[] = [];
      const totalChargingPower = 0;
      const companiesHash = {};

      let unixTimestamp = getUnixTimestamp();
      const beginTemplateData: DataObject = {
        step: "Begin",
        timestamp: unixTimestamp,
        companies,
        totalChargingStations,
        totalChargingPower,
      };

      for (const command of listCommands) {
        let tempData;
        const splitCommand = command.split(" ");
        if (command === "begin") {
          tempData = { ...beginTemplateData };
        } else if (splitCommand[0] === "wait") {
          unixTimestamp += Number(splitCommand[1]);
          continue;
        } else if (splitCommand[0] === "start") {
          const stationInfo = splitCommand[2];
          await processStartStation(
            stationInfo,
            companies,
            totalChargingStations,
            totalChargingPower,
            companiesHash
          );
          tempData = {
            ...beginTemplateData,
            timestamp: unixTimestamp,
            companies,
            step: `Start station ${stationInfo}`,
          };
        } else if (splitCommand[0] === "stop") {
          tempData = {
            ...beginTemplateData,
            timestamp: unixTimestamp,
            step: `Stop ${splitCommand[1]} ${splitCommand[2]}`,
          };
        } else if (command === "end") {
          tempData = {
            ...beginTemplateData,
            timestamp: unixTimestamp,
            step: "End",
          };
        }

        if (tempData) {
          data.push(tempData);
        }
      }

      res.status(200).json({
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(commonConstants.internalServerError);
    }
  };

  public routes() {
    this.router.post("/parser", this.parser);
  }
}
