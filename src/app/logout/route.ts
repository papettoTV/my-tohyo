import { NextRequest, NextResponse } from "next/server"

// /logout にアクセスされたら認証用 cookie を削除し、localStorage も削除してから /login に遷移
export async function GET(req: NextRequest) {
  const loginUrl = new URL("/login", req.url)

  // Cookie(token) を削除
  const res = new NextResponse(
    `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>Logging out...</title>
    <script>
      try {
        // 認証関連の localStorage を削除
        localStorage.removeItem("token");
      } catch (e) {}
      // 念のため即時遷移
      location.replace("${loginUrl.pathname}");
    </script>
    <noscript>
      JavaScript が無効です。<a href="${loginUrl.pathname}">こちら</a>をクリックしてログインページへ移動してください。
    </noscript>
  </head>
  <body>Logging out...</body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // JS 実行前にブラウザが勝手にキャッシュしないように
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    }
  )

  res.cookies.set({
    name: "token",
    value: "",
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  })

  return res
}

// もし POST で叩く場合にも同様の挙動にしておく
export async function POST(req: NextRequest) {
  return GET(req)
}
