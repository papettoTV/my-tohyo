"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Vote,
  User,
  Building,
  FileText,
  ExternalLink,
  Camera,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"

type VoteDetail = {
  vote_id: number
  user_id: number
  election_id: number
  candidate_name?: string | null
  vote_date?: string | null
  social_post_url?: string | null
  notes?: string | null
  election_name?: string | null
  election_date?: string | null
  election_type_name?: string | null
}

function resolveApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:3001"
  )
}

export default function HistoryDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [vote, setVote] = useState<VoteDetail | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    const base = resolveApiBase()

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

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      if (mounted) {
        setError("認証情報が見つかりません")
        setVote(null)
      }
      return () => {
        mounted = false
      }
    }

    fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 404) {
          if (mounted) setVote(null)
          return null
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

    const base = resolveApiBase()
    let alive = true
    setImageLoading(true)

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      setResolvedImageUrl(null)
      setImageLoading(false)
      return () => {
        alive = false
      }
    }

    const apiUrl = `${base}/api/social-image?url=${encodeURIComponent(
      vote.social_post_url
    )}`

    fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
  const electionDateDisplay = vote.election_date
    ? format(new Date(vote.election_date), "yyyy年M月d日")
    : "—"
  const voteDateDisplay = vote.vote_date
    ? format(new Date(vote.vote_date), "yyyy年M月d日 HH:mm")
    : "—"
  const electionType = vote.election_type_name || "—"
  const candidateName = vote.candidate_name || "—"
  const partyName = "—" // party isn't currently joined in API; keep placeholder
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
            <div className="text-sm text-gray-600 mt-1">{voteDateDisplay}</div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{electionTitle}</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {electionDateDisplay} ({electionType})
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800">記録</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Election Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Vote className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">選挙種類</div>
                      <div className="text-gray-600">{electionType}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">候補者名</div>
                      <div className="text-gray-600">{candidateName}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <div className="font-medium">所属政党</div>
                      <div className="text-gray-600">{partyName}</div>
                    </div>
                  </div>
                </div>

                {/* Voting Photo */}
                <div className="space-y-2">
                  <div className="font-medium flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    投票写真
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayImageUrl}
                      alt="投票写真"
                      className="w-full h-48 object-cover rounded"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        シェア
                      </Button>
                    </div>
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

          {/* Manifesto & Performance (static placeholders) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  マニフェスト
                </CardTitle>
                <CardDescription>候補者の選挙時の公約・政策</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-medium">経済政策</h4>
                    <p className="text-sm text-gray-600">
                      中小企業支援と雇用創出
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <h4 className="font-medium">環境政策</h4>
                    <p className="text-sm text-gray-600">
                      再生可能エネルギー推進
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3">
                    <h4 className="font-medium">社会保障</h4>
                    <p className="text-sm text-gray-600">子育て支援の充実</p>
                  </div>
                </div>
                <Link href="/manifesto/1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    詳細を見る
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  実績・活動
                </CardTitle>
                <CardDescription>当選後の活動実績</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-medium">法案提出</h4>
                    <p className="text-sm text-gray-600">
                      中小企業支援法案を共同提出
                    </p>
                    <p className="text-xs text-gray-500">2024年11月</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <h4 className="font-medium">委員会活動</h4>
                    <p className="text-sm text-gray-600">
                      環境委員会で再エネ推進を議論
                    </p>
                    <p className="text-xs text-gray-500">2024年12月</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3">
                    <h4 className="font-medium">地域活動</h4>
                    <p className="text-sm text-gray-600">
                      子育て支援センター視察
                    </p>
                    <p className="text-xs text-gray-500">2024年12月</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  活動詳細を見る
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
