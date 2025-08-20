import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { SocialAccount } from "./SocialAccount"

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

  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts!: SocialAccount[]
}
