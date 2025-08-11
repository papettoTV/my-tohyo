import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./models/User"
import { SocialAccount } from "./models/SocialAccount"
import { Candidate } from "./models/Candidate"
import { Election } from "./models/Election"
import { ElectionType } from "./models/ElectionType"
import { Party } from "./models/Party"
import { VoteRecord } from "./models/VoteRecord"
import * as dotenv from "dotenv"
import { resolve } from "path"

// .env.local があれば優先して読み込む
const envLocalPath = resolve(__dirname, "../.env.local")
dotenv.config({ path: envLocalPath })

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, // 本番はfalse推奨
  logging: false,
  entities: [User, SocialAccount],
  migrations: [__dirname + "/migrations/*.ts"],
  subscribers: [],
})
