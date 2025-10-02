import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm"

export type AchievementFormat = "html" | "markdown"

@Entity({ name: "achievement" })
@Unique(["candidate_name", "election_name"])
export class Achievement {
  @PrimaryGeneratedColumn()
  achievement_id!: number

  @Column({ length: 150 })
  election_name!: string

  @Column({ length: 100 })
  candidate_name!: string

  @Column({ type: "text" })
  content!: string

  @Column({ name: "content_format", length: 20, default: "markdown" })
  content_format!: AchievementFormat
}
