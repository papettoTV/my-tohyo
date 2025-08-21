import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "election_type" })
export class ElectionType {
  @PrimaryGeneratedColumn()
  election_type_id!: number

  @Column({ type: "varchar", length: 100 })
  name!: string
}
