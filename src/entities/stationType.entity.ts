import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { IsNotEmpty, IsString, IsNumber } from "class-validator";
import { StationEntity } from "./station.entity";

@Entity("stationType")
@Unique(["name"])
export class StationTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  maxPower: number;

  @OneToMany(() => StationEntity, (station) => station.stationType, {})
  stations: StationEntity[];
}
