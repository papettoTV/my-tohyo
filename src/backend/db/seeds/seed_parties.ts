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
  "無所属",
]

async function main() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    const repo = AppDataSource.getRepository(Party)

    // 現在のDBレコードを取得
    const allRecords = await repo.find()
    let removed = 0
    let skipped = 0
    for (const record of allRecords) {
      // シードリストに含まれていない場合は削除を試みる
      if (!seedPartyNames.includes(record.name)) {
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
    for (const name of seedPartyNames) {
      const exists = await repo.findOne({ where: { name } })
      if (!exists) {
        const party = repo.create({ name })
        await repo.save(party)
        inserted++
      }
    }

    const total = await repo.count()
    console.log(`政党シード完了: ${inserted}件追加 / ${removed}件削除 / ${skipped}件スキップ / 合計 ${total}件`)
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
