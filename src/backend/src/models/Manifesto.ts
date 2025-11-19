import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm"
import { Candidate } from "./Candidate"

export type ManifestoFormat = "html" | "markdown"
export type ManifestoStatus = "PROGRESS" | "COMPLETE"

@Entity({ name: "manifesto" })
@Unique(["candidate_id", "election_name"])
export class Manifesto {
  @PrimaryGeneratedColumn()
  manifesto_id!: number

  @Column({ length: 150 })
  election_name!: string

  @Column({ type: "int" })
  candidate_id!: number

  @ManyToOne(() => Candidate, (candidate) => candidate.manifestos, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "candidate_id" })
  candidate!: Candidate

  @Column({ length: 100 })
  candidate_name!: string

  @Column({ type: "text" })
  content!: string

  @Column({ name: "content_format", length: 20, default: "markdown" })
  content_format!: ManifestoFormat

  @Column({ type: "varchar", length: 20, nullable: true, default: null })
  status!: ManifestoStatus | null
}
