import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import { Party } from "./Party"
import { Manifesto } from "./Manifesto"
// 候補者
@Entity({ name: "candidate" })
export class Candidate {
  @PrimaryGeneratedColumn()
  candidate_id!: number

  @Column({ length: 100 })
  name!: string

  @Column({ type: "int", nullable: true })
  party_id!: number | null

  @ManyToOne(() => Party, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "party_id" })
  party?: Party | null

  @Column({ type: "varchar", length: 255, nullable: true })
  manifesto_url?: string | null

  @Column({ type: "text", nullable: true })
  achievements?: string | null

  // @OneToOne(() => Achievement, (achievement) => achievement.candidate)
  // achievement?: Achievement

  @OneToMany(() => Manifesto, (manifesto) => manifesto.candidate)
  manifestos?: Manifesto[]
}
