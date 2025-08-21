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

type GlobalWithDS = {
  __appDataSource?: DataSource
  __appDataSourceInit?: Promise<DataSource> | null
}

// ホットリロードでも単一インスタンスを維持するため globalThis にキャッシュ
const g = globalThis as unknown as GlobalWithDS

export const AppDataSource =
  g.__appDataSource ??
  new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true, // 本番はfalse推奨
    logging: false,
    entities: [User, SocialAccount, Party],
    migrations: [__dirname + "/migrations/*.ts"],
    subscribers: [],
  })

if (!g.__appDataSource) {
  g.__appDataSource = AppDataSource
}

// 多重初期化を防ぐために Promise で初期化を直列化
export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) return AppDataSource
  if (!g.__appDataSourceInit) {
    g.__appDataSourceInit = AppDataSource.initialize().catch((err) => {
      g.__appDataSourceInit = null
      throw err
    })
  }
  return g.__appDataSourceInit
}
