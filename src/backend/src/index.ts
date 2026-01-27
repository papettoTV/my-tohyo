import * as dotenv from "dotenv"
import { existsSync } from "fs"
import { resolve } from "path"

// .env.local があれば優先して読み込み、その後 .env を読み込む
// dotenv は既存の環境変数を上書きしないため、先に読み込んだものが優先される
const envLocalPath = resolve(__dirname, "../.env.local")
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
}
dotenv.config()

import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

import userRouter from "./routes/user"
import socialAccountRouter from "./routes/socialAccount"
import electionTypeRouter from "./routes/electionType"
import partyRouter from "./routes/party"
import candidateRouter from "./routes/candidate"
import voteRecordRouter from "./routes/voteRecord"
import socialImageRouter from "./routes/socialImage"
import manifestoRouter from "./routes/manifesto"
import achievementsRouter from "./routes/achievements"

import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import swaggerOptions from "./swagger"

const swaggerSpec = swaggerJSDoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ルーティングを各モジュールに分割して追加
app.use("/api/users", userRouter)
app.use("/api/social-accounts", socialAccountRouter)
app.use("/api/social-image", socialImageRouter)
app.use("/api/election-types", electionTypeRouter)
app.use("/api/parties", partyRouter)
app.use("/api/candidates", candidateRouter)
app.use("/api/vote-records", voteRecordRouter)
app.use("/api/manifestos", manifestoRouter)
app.use("/api/achievements", achievementsRouter)

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend API server running on port ${PORT}`)
})
