"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft,
  Calendar,
  Vote,
  User,
  Building,
  FileText,
  Camera,
  Clock,
  ExternalLink,
  Trash2, 
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"

type ManifestoStatus = "PROGRESS" | "COMPLETE"

type ManifestoDetail = {
  content_id: number
  election_name: string
  candidate_name: string
  content: string
  content_format: "markdown" | "html"
  candidate_id?: number | null
  status?: ManifestoStatus | null
}

type AchievementDetail = {
  content_id: number
  election_name: string
  candidate_name: string
  content: string
  content_format: "markdown" | "html"
  updated_at?: string | null
}

type VoteDetail = {
  vote_id: number
  user_id: number
  candidate_id?: number | null
  candidate_name?: string | null
  vote_date?: string | null
  social_post_url?: string | null
  notes?: string | null
  election_name?: string | null
  election_type_name?: string | null
  party_id?: number | null
  party_name?: string | null
  election_type_id?: number | null
  manifesto?: ManifestoDetail | null
  achievement?: AchievementDetail | null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function applyInlineFormatting(input: string): string {
  let formatted = escapeHtml(input)

  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>'
  )
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>")
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>")

  return formatted
}

function markdownToHtml(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, "\n")
  const lines = normalized.split(/\n/)
  const chunks: string[] = []
  let inList = false
  let paragraphBuffer: string[] = []

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return
    const paragraph = paragraphBuffer.join("<br />")
    chunks.push(`<p>${applyInlineFormatting(paragraph)}</p>`)
    paragraphBuffer = []
  }

  const closeList = () => {
    if (inList) {
      chunks.push("</ul>")
      inList = false
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (line.trim() === "") {
      flushParagraph()
      closeList()
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushParagraph()
      closeList()
      const level = Math.min(headingMatch[1].length, 6)
      const content = applyInlineFormatting(headingMatch[2].trim())
      chunks.push(`<h${level}>${content}</h${level}>`)
      continue
    }

    const listMatch = line.match(/^\s*[-*+]\s+(.*)$/)
    if (listMatch) {
      flushParagraph()
      if (!inList) {
        chunks.push("<ul>")
        inList = true
      }
      const itemContent = applyInlineFormatting(listMatch[1].trim())
      chunks.push(`<li>${itemContent}</li>`)
      continue
    }

    paragraphBuffer.push(line.trim())
  }

  flushParagraph()
  closeList()

  if (chunks.length === 0) {
    return `<p>${applyInlineFormatting(markdown)}</p>`
  }

  return chunks.join("\n")
}

const API_BASE = ""

export default function HistoryDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [vote, setVote] = useState<VoteDetail | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState<boolean>(false)

  const manifesto = vote?.manifesto ?? null
  const manifestoContent = manifesto?.content ?? ""
  const manifestoFormat = manifesto?.content_format ?? "markdown"
  const manifestoHtml = useMemo(() => {
    const body = manifestoContent.trim()
    if (!body) return null
    if (manifestoFormat === "html") {
      return body
    }
    return markdownToHtml(body)
  }, [manifestoContent, manifestoFormat])

  const achievement = vote?.achievement ?? null
  const achievementContent = achievement?.content ?? ""
  const achievementFormat = achievement?.content_format ?? "markdown"
  const achievementHtml = useMemo(() => {
    const body = achievementContent.trim()
    if (!body) return null
    if (achievementFormat === "html") {
      return body
    }
    return markdownToHtml(body)
  }, [achievementContent, achievementFormat])
  const achievementUpdatedAt = achievement?.updated_at

  const isWithinOneMonth = useMemo(() => {
    if (!vote?.vote_date) return false
    const voteDate = new Date(vote.vote_date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return voteDate > thirtyDaysAgo
  }, [vote?.vote_date])

  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = useCallback(async () => {
    if (!vote || isDeleting) return
    
    setIsDeleting(true)
    try {
      const base = ""
      const res = await fetch(`${base}/api/vote-records/${vote.vote_id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        toast({
          title: "削除完了",
          description: "投票履歴を削除しました",
        })
        router.push("/history")
        return
      }

      if (res.status === 401) {
        toast({
          title: "エラー",
          description: "認証情報が見つかりません",
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      throw new Error(`Failed to delete: ${res.status}`)
    } catch (e) {
      console.error("Delete error:", e)
      toast({
        title: "エラー",
        description: "削除中にエラーが発生しました",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }, [vote, isDeleting, router, toast])


  useEffect(() => {
    let mounted = true
    const base = ""

    setVote(undefined)
    setError(null)

    // Resolve id defensively: prefer useParams(), fallback to parsing pathname.
    const resolvedId =
      id ||
      (typeof window !== "undefined"
        ? window.location.pathname.split("/").filter(Boolean).pop()
        : undefined)

    if (!resolvedId) {
      console.warn("[HistoryDetailPage] resolvedId is missing; aborting fetch")
      if (mounted) {
        setError("ID が指定されていません")
        setVote(null)
      }
      return
    }

    const url = `${base}/api/vote-records/${resolvedId}`

    fetch(url, {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 404) {
          if (mounted) setVote(null)
          return null
        }
        if (res.status === 401) {
          throw new Error("Unauthorized")
        }
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        if (data) setVote(data as VoteDetail)
      })
      .catch((e) => {
        console.error("Failed to fetch vote detail:", e)
        if (mounted) {
          setError(String(e))
          setVote(null)
        }
      })

    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    // Resolve image URL from social_post_url via backend API
    setResolvedImageUrl(null)
    if (!vote?.social_post_url) return

    const base = ""
    let alive = true
    setImageLoading(true)

    const apiUrl = `${base}/api/social-image?url=${encodeURIComponent(
      vote.social_post_url
    )}`

    fetch(apiUrl, {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        return res.json()
      })
      .then((data: { imageUrl?: string }) => {
        if (!alive) return
        setResolvedImageUrl(data?.imageUrl ?? null)
      })
      .catch((e) => {
        console.error("Failed to resolve social image URL:", e)
        if (!alive) return
        setResolvedImageUrl(null)
      })
      .finally(() => {
        if (!alive) return
        setImageLoading(false)
      })

    return () => {
      alive = false
    }
  }, [vote?.social_post_url])


  // loading state
  if (vote === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Link href="/history">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                履歴一覧に戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">投票履歴詳細</h1>
          </div>

          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-600">読み込み中...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // not found / error
  if (vote === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Link href="/history">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                履歴一覧に戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">投票履歴詳細</h1>
          </div>

          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-600">
                  投票履歴が見つかりませんでした、または読み込み中にエラーが発生しました。
                </p>
                {error && (
                  <p className="text-xs text-red-600 mt-2">エラー: {error}</p>
                )}
                <Link href="/history">
                  <Button className="mt-4">履歴一覧へ戻る</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // success: vote is VoteDetail
  const electionTitle = vote.election_name || "—"
  const electionDateDisplay = vote.vote_date
    ? format(new Date(vote.vote_date), "yyyy年M月d日")
    : "—"
  const voteDateDisplay = vote.vote_date
    ? format(new Date(vote.vote_date), "yyyy年M月d日 HH:mm")
    : "—"
  const electionType = vote.election_type_name || "—"
  const candidateName = vote.candidate_name || "—"
  const partyName = vote.party_name?.trim() || "—"
  const socialPostUrlRaw = vote.social_post_url || null
  const displayImageUrl =
    resolvedImageUrl ||
    socialPostUrlRaw ||
    "/placeholder.svg?height=200&width=300"
  const notes = vote.notes || ""

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/history">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              履歴一覧に戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">投票履歴詳細</h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6 xl:space-y-0 xl:grid xl:grid-cols-[1.6fr_1fr] xl:items-start xl:gap-6">
          {/* Main Info Card */}
          <Card className="order-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{electionTitle}</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {electionDateDisplay}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Election Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start">
                  <Vote className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <div className="text-gray-600">選挙種類</div>
                    <div className="font-medium">{electionType}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <User className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <div className="text-gray-600">候補者名</div>
                    <div className="font-medium">{candidateName}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Building className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                  <div>
                    <div className="text-gray-600">所属政党</div>
                    <div className="font-medium">{partyName}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                  <div>
                    <div className="text-gray-600">投票日時</div>
                    <div className="font-medium">{voteDateDisplay}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div>
                <h3 className="font-medium mb-2">投票メモ</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    {notes || "メモはありません。"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="order-2 space-y-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {vote.candidate_name ? "実績・活動" : "政党の実績・活動"}
                </CardTitle>
                <CardDescription>{vote.candidate_name ? "活動実績" : "所属政党の活動実績"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isWithinOneMonth ? (
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                    投票日から1ヶ月後に実績・活動が確認できます。
                  </div>
                ) : achievementHtml ? (
                  <>
                    <div
                      className="space-y-3 text-sm leading-relaxed text-gray-700 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-700 [&_a]:font-medium [&_a]:break-words"
                      dangerouslySetInnerHTML={{ __html: achievementHtml }}
                    />
                    {achievementUpdatedAt && (
                      <div className="text-xs text-gray-400 mt-4 text-right">
                        最終更新: {format(new Date(achievementUpdatedAt), "yyyy/MM/dd HH:mm")}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                    登録された実績・活動情報がまだありません。
                  </div>
                )}
                <div className="pt-2">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      `${partyName}の${candidateName}の${
                        vote.vote_date ? format(new Date(vote.vote_date), "yyyy年M月d日") : ""
                      }から現在まで実績・活動`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Google検索で調べる
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Manifesto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {vote.candidate_name ? "マニフェスト" : "政党マニフェスト"}
                </CardTitle>
                <CardDescription>{vote.candidate_name ? "候補者の選挙時の公約・政策" : "所属政党の公約・政策"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {manifestoHtml ? (
                  <div
                    className="space-y-3 text-sm leading-relaxed text-gray-700 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-700 [&_a]:font-medium [&_a]:break-words"
                    dangerouslySetInnerHTML={{ __html: manifestoHtml }}
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                    登録されたマニフェスト情報がまだありません。
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Camera className="w-5 h-5 mr-2" />
                投票写真
              </CardTitle>
              <CardDescription>
                投稿から取得した写真をここで確認できます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-lg border bg-gray-50">
                {imageLoading ? (
                  <div className="flex h-40 items-center justify-center text-sm text-gray-500">
                    画像を読み込んでいます...
                  </div>
                ) : resolvedImageUrl || socialPostUrlRaw ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayImageUrl}
                      alt="投票写真"
                      className="h-40 w-full object-cover"
                    />
                  </>
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-gray-500">
                    取得できる写真がありません。
                  </div>
                )}
              </div>
              {socialPostUrlRaw && (
                <a
                  href={socialPostUrlRaw}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />X の投稿を開く
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Button Area */}
        <div className="max-w-5xl mx-auto mt-12 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="w-4 h-4 mr-2" />
                この投票履歴を削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。投票履歴と関連するデータが完全に削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-600 focus:ring-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "削除中..." : "削除する"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </div>
    </div>
  )
}
