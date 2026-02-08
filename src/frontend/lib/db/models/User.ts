import { Entity, PrimaryGeneratedColumn, Column, OneToMany, type Relation } from "typeorm"
import type { SocialAccount } from "./SocialAccount"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number

  @Column({ nullable: true })
  name?: string

  @Column({ unique: true })
  email!: string

  @Column()
  region!: string

  @OneToMany("SocialAccount", "user")
  socialAccounts!: Relation<SocialAccount[]>
}
