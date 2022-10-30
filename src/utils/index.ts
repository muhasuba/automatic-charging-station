import "dotenv/config";
import { DataSourceOptions, DataSource } from "typeorm";
import { CompanyEntity, StationEntity, StationTypeEntity } from "../entities";

const connectOptions: DataSourceOptions = {
  type: process.env.DB_TYPE as "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_INSTANCE,
  synchronize: true,
  entities: [
    process.env.NODE_ENV === "prod"
      ? "build/**/*.entity{,.js}"
      : "src/**/*.entity{.ts,.js}",
  ],
  migrations: ["src/migration/*.ts"],
};

export const DB = new DataSource(connectOptions);

export const initDB = async () => {
  const db = await DB.initialize();

  await clearDB();

  return db;
};

export const initDBWithData = async () => {
  const db = await DB.initialize();

  await clearDB();
  await createDemoTestData();

  return db;
};

export const createDemoTestData = async () => {
  await createCompany("Company 1");
  await createCompany("Company 2", 1);
  await createCompany("Company 3", 1);
  await createStationType("Station Type 1", 10);
  await createStation("Station 1", 3, 1);
  await createStation("Station 2", 2, 1);
  await createStation("Station 3", 2, 1);
  await createStation("Station 4", 3, 1);
  await createStation("Station 5", 1, 1);
};

export const createCompany = async (
  name: string,
  parentCompanyId?: number | null
) => {
  const company = new CompanyEntity();

  company.name = name;
  let parentCompany;
  if (parentCompanyId) {
    try {
      parentCompany = await DB.getRepository(CompanyEntity).findOneOrFail({
        where: {
          id: Number(parentCompanyId),
        },
      });
    } catch (error) {
      console.log(
        `Failed create company with name ${name} and parentCompanyId ${parentCompanyId}. Invalid parentCompanyId`
      );
    }
    company.parentCompany = parentCompany;
  }

  await DB.getRepository(CompanyEntity).save(company);

  return company;
};

export const createStationType = async (name: string, maxPower: number) => {
  const stationType = new StationTypeEntity();

  stationType.name = name;
  stationType.maxPower = maxPower;

  await DB.getRepository(StationTypeEntity).save(stationType);

  return stationType;
};

export const createStation = async (
  name: string,
  companyId: number,
  stationTypeId: number
) => {
  const station = new StationEntity();

  station.name = name;

  let company;
  try {
    company = await DB.getRepository(CompanyEntity).findOneOrFail({
      where: {
        id: Number(companyId),
      },
    });
  } catch (error) {
    console.log(
      `Failed create station with name ${name} and companyId ${companyId}. Invalid companyId`
    );
    return;
  }
  station.company = company;

  let stationType;
  try {
    stationType = await DB.getRepository(StationTypeEntity).findOneOrFail({
      where: {
        id: Number(stationTypeId),
      },
    });
  } catch (error) {
    console.log(
      `Failed create station with name ${name} and stationTypeId ${stationTypeId}. Invalid stationTypeId`
    );
    return;
  }
  station.stationType = stationType;

  await DB.getRepository(StationEntity).save(station);

  return station;
};

export const clearDB = async () => {
  const entities = DB.entityMetadatas;
  for (const entity of entities) {
    const repository = await DB.getRepository(entity.name);
    await repository.query(
      `TRUNCATE "${entity.tableName}" RESTART IDENTITY CASCADE;`
    );
  }
};

export const clearCompanies = async () => {
  const companyRepository = await DB.getRepository(CompanyEntity);
  await companyRepository.query(`TRUNCATE "company" RESTART IDENTITY CASCADE;`);
};

export const clearStations = async () => {
  const stationRepository = await DB.getRepository(StationEntity);
  await stationRepository.query(`TRUNCATE "station" RESTART IDENTITY CASCADE;`);
};

export const clearStationTypes = async () => {
  const stationTypeRepository = await DB.getRepository(StationTypeEntity);
  await stationTypeRepository.query(
    `TRUNCATE "stationType" RESTART IDENTITY CASCADE;`
  );
};

export const dropDB = async () => {
  await DB.destroy();
};

export const getTimeNow = () => {
  return new Date();
};

export const getTimeAfterDelay = (prevTime: Date, delayInSecond: number) => {
  return new Date(prevTime.setSeconds(prevTime.getSeconds() + delayInSecond));
};

export const getUnixTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

export const emptyObject = (inputObject: Record<string, unknown>) => {
  Object.getOwnPropertyNames(inputObject).forEach(function (prop) {
    delete inputObject[prop];
  });
};
