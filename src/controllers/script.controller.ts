import { Router, Response, Request } from "express";
import { commonConstants } from "../constants";
import { CompanyEntity, StationEntity, StationTypeEntity } from "../entities";
import { DB, getUnixTimestamp } from "../utils";

interface CompanyHashObject {
  chargingStations: number[];
  chargingPower: number;
}

interface CompaniesHashObject {
  [key: string]: CompanyHashObject;
}

interface StationsHashObject {
  [key: string]: number;
}

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

const convertCompaniesHash = (companiesHash: CompaniesHashObject) => {
  console.log("companiesHash", JSON.stringify(companiesHash));
  const companies = [];
  const companiesValue = JSON.parse(JSON.stringify(companiesHash));

  for (const key of Object.keys(companiesValue)) {
    console.log(key, companiesValue[key]);
    const tempCompany = {
      id: Number(key),
      chargingStations: companiesValue[key].chargingStations,
      chargingPower: companiesValue[key].chargingPower,
    };
    companies.push(tempCompany);
  }
  return companies;
};

const convertStationsHash = (stationsHash: StationsHashObject) => {
  console.log("companiesHash", JSON.stringify(convertStationsHash));
  const stationsValue = JSON.parse(JSON.stringify(stationsHash));
  const totalChargingStations: number[] = [];
  let totalChargingPower = 0;

  for (const key of Object.keys(stationsValue)) {
    totalChargingStations.push(Number(key));
    totalChargingPower += Number(stationsValue[key]);
  }
  return {
    totalChargingStations,
    totalChargingPower,
  };
};

const processStartCompaniesHashHelper = (
  companiesHash: { [key: string]: CompanyHashObject },
  companyId: number,
  stationId: number,
  maxPower: number
) => {
  if (
    companyId in companiesHash &&
    !(stationId in companiesHash[companyId]["chargingStations"])
  ) {
    companiesHash[companyId]["chargingStations"].push(stationId);
    companiesHash[companyId]["chargingPower"] += maxPower;
  } else {
    const tempCompanyHasData = {
      chargingStations: [stationId],
      chargingPower: maxPower,
    };
    companiesHash[companyId] = tempCompanyHasData;
  }
};

const processStartCompaniesHash = (
  companiesHash: CompaniesHashObject,
  station: StationEntity,
  stationType: StationTypeEntity,
  company: CompanyEntity
) => {
  processStartCompaniesHashHelper(
    companiesHash,
    company.id,
    station.id,
    stationType.maxPower
  );
  if (company.parentCompany) {
    processStartCompaniesHashHelper(
      companiesHash,
      company.parentCompany.id,
      station.id,
      stationType.maxPower
    );
  }
};

const procesStationsHash = (
  stationsHash: StationsHashObject,
  stationId: number,
  maxPower: number
) => {
  stationsHash[stationId] = maxPower;
};

const processStartStopStationHelper = async (
  station: StationEntity,
  companiesHash: CompaniesHashObject,
  stationsHash: StationsHashObject
) => {
  const company = await DB.getRepository(CompanyEntity).findOneOrFail({
    where: {
      id: Number(station.company.id),
    },
    relations: {
      parentCompany: true,
    },
  });
  processStartCompaniesHash(
    companiesHash,
    station,
    station.stationType,
    company
  );
  procesStationsHash(stationsHash, station.id, station.stationType.maxPower);
};

const processStartStopStation = async (
  stationInfo: string,
  companiesHash: CompaniesHashObject,
  stationsHash: StationsHashObject,
  command: "start" | "stop"
) => {
  if (stationInfo === "all") {
    const stations = await DB.getRepository(StationEntity).find({
      relations: {
        company: true,
        stationType: true,
      },
    });
    console.log("stations", JSON.stringify(stations));
    for (const station of stations) {
      if (command === "start") {
        await processStartStopStationHelper(
          station,
          companiesHash,
          stationsHash
        );
      }
    }
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
    if (command === "start") {
      await processStartStopStationHelper(station, companiesHash, stationsHash);
    }
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
      const companiesHash: CompaniesHashObject = {};
      const stationsHash: StationsHashObject = {};

      let unixTimestamp = getUnixTimestamp();
      const beginTemplateData: DataObject = {
        step: "Begin",
        timestamp: unixTimestamp,
        companies: [],
        totalChargingStations: [],
        totalChargingPower: 0,
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
          await processStartStopStation(
            stationInfo,
            companiesHash,
            stationsHash,
            "start"
          );
          const { totalChargingStations, totalChargingPower } =
            convertStationsHash(stationsHash);
          const companies = convertCompaniesHash(companiesHash);
          tempData = {
            step: `Start station ${stationInfo}`,
            timestamp: unixTimestamp,
            companies,
            totalChargingStations,
            totalChargingPower,
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
