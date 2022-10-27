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

  return db;
};

export const initDBWithData = async () => {
  const db = await DB.initialize();

  await clearDB();
  // await createInitialCompany();
  // await createInitialStationType();

  return db;
};

export const createInitialCompany = async () => {
  const company = new CompanyEntity();

  company.name = "Initial Company Test";

  await DB.getRepository(CompanyEntity).save(company);

  return company;
};

export const createInitialStationType = async () => {
  const stationType = new StationTypeEntity();

  stationType.name = "Initial Station Type Test";
  stationType.maxPower = 1;

  await DB.getRepository(StationTypeEntity).save(stationType);

  return stationType;
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

export const jwtSecret = process.env.JWT_SECRET as string;
