import { Entity, PrimaryGeneratedColumn, Column, OneToMany, type Relation } from "typeorm"
import { SocialAccount } from "./SocialAccount"

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number

  @Column({ nullable: true })
  name?: string

  @Column({ unique: true })
  email!: string

  @Column()
  region!: string

  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts!: Relation<SocialAccount[]>
}
