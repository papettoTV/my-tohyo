import "reflect-metadata"
import { AppDataSource } from "../../src/data-source"
import { Party } from "../../src/models/Party"

const seedPartyNames = [
  "自由民主党",
  "立憲民主党",
  "日本維新の会",
  "公明党",
  "国民民主党",
  "日本共産党",
  "れいわ新選組",
  "社会民主党",
  "参政党",
  "NHK党",
]

async function main() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    const repo = AppDataSource.getRepository(Party)

    let inserted = 0
    for (const name of seedPartyNames) {
      const exists = await repo.findOne({ where: { name } })
      if (!exists) {
        const party = repo.create({ name })
        await repo.save(party)
        inserted++
      }
    }

    const total = await repo.count()
    console.log(`政党シード完了: ${inserted}件追加 / 合計 ${total}件`)
  } catch (err) {
    console.error("政党シードに失敗:", err)
    process.exit(1)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

main()
