import "reflect-metadata"
import { AppDataSource } from "../src/data-source"
import { User } from "../src/models/User"

async function main() {
  try {
    // DB初期化
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const userRepo = AppDataSource.getRepository(User)

    // サンプルユーザー作成
    const user = userRepo.create({
      name: "サンプル太郎",
      email: "sample_address@example.com",
      region: "Tokyo",
    })

    const savedUser = await userRepo.save(user)

    console.log("新規ユーザーを登録しました:", savedUser)
  } catch (err) {
    console.error("ユーザー登録に失敗:", err)
    process.exit(1)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

main()
