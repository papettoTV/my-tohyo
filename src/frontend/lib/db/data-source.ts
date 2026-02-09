import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./models/User"
import { SocialAccount } from "./models/SocialAccount"
import { ElectionType } from "./models/ElectionType"
import { Party } from "./models/Party"
import { Candidate } from "./models/Candidate"
import { CandidateContent } from "./models/CandidateContent"
import { VoteRecord } from "./models/VoteRecord"

type GlobalWithDS = {
  __appDataSource?: DataSource
  __appDataSourceInit?: Promise<DataSource> | null
}

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
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true" }
        : false,
    synchronize: false, // Always false for frontend/production
    logging: process.env.NODE_ENV === "development",
    entities: [
      User,
      SocialAccount,
      ElectionType,
      Party,
      Candidate,
      CandidateContent,
    ],
    // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })

if (process.env.NODE_ENV !== "production") {
  if (!g.__appDataSource) {
    g.__appDataSource = AppDataSource
  }
}

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
