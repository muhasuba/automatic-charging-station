import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { IsNotEmpty, IsString } from "class-validator";
import { CompanyEntity } from "./company.entity";
import { StationTypeEntity } from "./stationType.entity";

@Entity("station")
@Unique(["name"])
export class StationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ManyToOne(() => CompanyEntity, (company) => company.stations)
  company: CompanyEntity;

  @ManyToOne(() => StationTypeEntity, (stationType) => stationType.stations)
  stationType: CompanyEntity;
}
