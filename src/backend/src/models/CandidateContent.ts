import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from "typeorm"
import { Candidate } from "./Candidate"
import { Party } from "./Party"

export type ContentType = "manifesto" | "achievement"
export type ContentFormat = "html" | "markdown"
export type ManifestoStatus = "PROGRESS" | "COMPLETE"

@Entity({ name: "candidate_content" })
@Unique(["candidate_id", "party_id", "election_name", "type"])
export class CandidateContent {
  @PrimaryGeneratedColumn()
  content_id!: number

  @Column({ type: "varchar", length: 20 })
  type!: ContentType

  @Column({ type: "varchar", length: 150 })
  election_name!: string

  @Column({ type: "int", nullable: true })
  candidate_id!: number | null

  @ManyToOne(() => Candidate, { onDelete: "CASCADE" })
  @JoinColumn({ name: "candidate_id" })
  candidate!: Candidate | null

  @Column({ type: "int", nullable: true })
  party_id!: number | null

  @ManyToOne(() => Party, { onDelete: "CASCADE" })
  @JoinColumn({ name: "party_id" })
  party!: Party | null

  @Column({ type: "varchar", length: 100 })
  candidate_name!: string

  @Column({ type: "text" })
  content!: string

  @Column({ name: "content_format", type: "varchar", length: 20, default: "markdown" })
  content_format!: ContentFormat

  @Column({ type: "varchar", length: 20, nullable: true })
  status!: ManifestoStatus | null
}
