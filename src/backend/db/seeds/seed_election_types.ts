import "reflect-metadata"
import { AppDataSource } from "../../src/data-source"
import { ElectionType } from "../../src/models/ElectionType"

const seedElectionTypeNames = ["小選挙区選挙", "比例代表選挙"]

async function main() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    const repo = AppDataSource.getRepository(ElectionType)

    let inserted = 0
    for (const name of seedElectionTypeNames) {
      const exists = await repo.findOne({ where: { name } })
      if (!exists) {
        const et = repo.create({ name })
        await repo.save(et)
        inserted++
      }
    }

    const total = await repo.count()
    console.log(`選挙種類シード完了: ${inserted}件追加 / 合計 ${total}件`)
  } catch (err) {
    console.error("選挙種類シードに失敗:", err)
    process.exit(1)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

main()
