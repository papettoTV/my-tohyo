import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  type Relation,
} from "typeorm"
import type { User } from "./User"

@Entity()
@Unique(["provider", "account_identifier"])
export class SocialAccount {
  @PrimaryGeneratedColumn()
  social_account_id!: number

  @Column()
  user_id!: number

  @ManyToOne("User", "socialAccounts")
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>

  @Column()
  provider!: string

  @Column()
  account_identifier!: string
}
