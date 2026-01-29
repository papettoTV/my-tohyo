import "reflect-metadata"
import { AppDataSource } from "../../src/data-source"
import { ElectionType } from "../../src/models/ElectionType"

const seedElectionTypeNames = [
  "衆議院選挙",
  "参議院選挙",
  "都道府県知事・県議会",
  "市区町村長・村議会",
]

async function main() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    const repo = AppDataSource.getRepository(ElectionType)

    // 現在のDBレコードを取得
    const allRecords = await repo.find()
    let removed = 0
    let skipped = 0
    for (const record of allRecords) {
      // シードリストに含まれていない場合は削除を試みる
      if (!seedElectionTypeNames.includes(record.name)) {
        try {
          await repo.remove(record)
          removed++
        } catch (err) {
          // 外部キー制約などで削除できない場合はスキップ
          console.warn(`削除をスキップしました (参照されている可能性があります): ${record.name}`)
          skipped++
        }
      }
    }

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
    console.log(`選挙種類シード完了: ${inserted}件追加 / ${removed}件削除 / ${skipped}件スキップ / 合計 ${total}件`)
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
