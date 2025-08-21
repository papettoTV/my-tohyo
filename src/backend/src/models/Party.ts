import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "party" })
export class Party {
  @PrimaryGeneratedColumn()
  party_id!: number

  @Column({ type: "varchar", length: 100 })
  name!: string
}
