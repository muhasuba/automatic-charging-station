import { Router, Response, Request } from "express";
import { commonConstants } from "../constants";
import { CompanyEntity, StationEntity } from "../entities";
import { DB, getUnixTimestamp, emptyObject } from "../utils";

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
  const companies = [];
  const companiesValue = JSON.parse(JSON.stringify(companiesHash));

  for (const key of Object.keys(companiesValue)) {
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
    !companiesHash[companyId]["chargingStations"].includes(stationId)
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

const processStopCompaniesHashHelper = (
  companiesHash: { [key: string]: CompanyHashObject },
  companyId: number,
  stationId: number,
  maxPower: number
) => {
  if (
    companyId in companiesHash &&
    stationId in companiesHash[companyId]["chargingStations"]
  ) {
    companiesHash[companyId]["chargingStations"] = companiesHash[companyId][
      "chargingStations"
    ].filter((item) => item !== stationId);
    companiesHash[companyId]["chargingPower"] -= maxPower;
  }
};

const procesStartStationsHash = (
  stationsHash: StationsHashObject,
  stationId: number,
  maxPower: number
) => {
  stationsHash[stationId] = maxPower;
};

const procesStopStationsHash = (
  stationsHash: StationsHashObject,
  stationId: number
) => {
  delete stationsHash[stationId];
};

const processStartStopStationHelper = async (
  station: StationEntity,
  companiesHash: CompaniesHashObject,
  stationsHash: StationsHashObject,
  command: "start" | "stop"
) => {
  const company = await DB.getRepository(CompanyEntity).findOneOrFail({
    where: {
      id: Number(station.company.id),
    },
    relations: {
      parentCompany: true,
    },
  });
  if (command === "start") {
    processStartCompaniesHashHelper(
      companiesHash,
      company.id,
      station.id,
      station.stationType.maxPower
    );
    if (company.parentCompany) {
      processStartCompaniesHashHelper(
        companiesHash,
        company.parentCompany.id,
        station.id,
        station.stationType.maxPower
      );
    }
    procesStartStationsHash(
      stationsHash,
      station.id,
      station.stationType.maxPower
    );
  } else {
    processStopCompaniesHashHelper(
      companiesHash,
      company.id,
      station.id,
      station.stationType.maxPower
    );
    if (company.parentCompany) {
      processStopCompaniesHashHelper(
        companiesHash,
        company.parentCompany.id,
        station.id,
        station.stationType.maxPower
      );
    }
    procesStopStationsHash(stationsHash, station.id);
  }
};

const processStartStopStation = async (
  stationInfo: string,
  companiesHash: CompaniesHashObject,
  stationsHash: StationsHashObject,
  command: "start" | "stop"
) => {
  if (stationInfo === "all") {
    if (command === "start") {
      const stations = await DB.getRepository(StationEntity).find({
        relations: {
          company: true,
          stationType: true,
        },
      });
      for (const station of stations) {
        await processStartStopStationHelper(
          station,
          companiesHash,
          stationsHash,
          command
        );
      }
    } else {
      emptyObject(companiesHash);
      emptyObject(stationsHash);
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
    await processStartStopStationHelper(
      station,
      companiesHash,
      stationsHash,
      command
    );
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

      // Next improvement- Add more validation input script
      if (
        listCommands[0] != "begin" ||
        listCommands[listCommands.length - 1] != "end"
      ) {
        res.status(400).send("Invalid input script");
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
          const stationInfo = splitCommand[2];
          await processStartStopStation(
            stationInfo,
            companiesHash,
            stationsHash,
            "stop"
          );
          const { totalChargingStations, totalChargingPower } =
            convertStationsHash(stationsHash);
          const companies = convertCompaniesHash(companiesHash);
          tempData = {
            step: `Stop station ${stationInfo}`,
            timestamp: unixTimestamp,
            companies,
            totalChargingStations,
            totalChargingPower,
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
