import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm"
import { User } from "./User"

@Entity()
@Unique(["provider", "account_identifier"])
export class SocialAccount {
  @PrimaryGeneratedColumn()
  social_account_id!: number

  @Column()
  user_id!: number

  @ManyToOne(() => User, (user) => user.socialAccounts)
  @JoinColumn({ name: "user_id" })
  user!: User

  @Column()
  provider!: string

  @Column()
  account_identifier!: string
}
