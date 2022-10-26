import "dotenv/config";
import { DataSourceOptions, DataSource } from "typeorm";
import { CompanyEntity } from "../entities";

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

  return db;
};

export const initDBWithAdmin = async () => {
  const db = await DB.initialize();

  await clearDB();

  return db;
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

export const createParentCompany = async () => {
  const company = new CompanyEntity();

  company.name = "Parent Company Sample";
  company.parentCompany = undefined;

  await DB.getRepository(CompanyEntity).save(company);

  return company;
};

export const createChildCompany = async (parentCompany: CompanyEntity) => {
  const company = new CompanyEntity();

  company.name = "Child Company Sample";
  company.parentCompany = parentCompany;

  await DB.getRepository(CompanyEntity).save(company);

  return company;
};

export const clearCompanies = async () => {
  const bookingRepository = await DB.getRepository(CompanyEntity);
  await bookingRepository.query(`TRUNCATE "company" RESTART IDENTITY CASCADE;`);
};

export const dropDB = async () => {
  await DB.destroy();
};

export const jwtSecret = process.env.JWT_SECRET as string;
