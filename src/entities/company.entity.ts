import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { IsNotEmpty, IsString } from "class-validator";
import { StationEntity } from "./station.entity";

@Entity("company")
@Unique(["name"])
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ManyToOne(() => CompanyEntity, (company) => company.childCompanies, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  parentCompany?: CompanyEntity;

  @OneToMany(() => CompanyEntity, (company) => company.parentCompany)
  childCompanies?: CompanyEntity[];

  @OneToMany(() => StationEntity, (station) => station.company)
  stations: StationEntity[];
}
