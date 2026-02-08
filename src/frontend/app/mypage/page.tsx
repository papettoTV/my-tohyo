 "use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { History, LogOut, Plus, Calendar, Vote, Building } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type VoteRecord = {
  vote_id: number
  vote_date: string
  user_id: number
  candidate_id?: number | null
  election_name: string
  election_type_id: number
  election_type_name?: string | null
  candidate_name?: string | null
  social_post_url?: string | null
  photo_url?: string | null
  party_id?: number | null
  party_name?: string | null
  notes?: string | null
}

function formatDisplayDate(value?: string | null): string {
  if (!value) return "日付不明"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(parsed)
  } catch {
    return value
  }
}

export default function MyPage() {
  const API_BASE = ""
  const [userName, setUserName] = useState("ユーザー")
  const [userId, setUserId] = useState<number | null>(null)
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([])
  const [loadingVotes, setLoadingVotes] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          cache: "no-store",
          credentials: "include",
        })
        if (!res.ok) return
        const user = await res.json()
        if (!mounted) return
        setUserName(user?.name || user?.email || "ユーザー")
        setUserId(typeof user?.user_id === "number" ? user.user_id : null)
      } catch {
        // 失敗時はデフォルトのまま表示
      }
    }

    async function loadVotes() {
      setLoadingVotes(true)
      try {
        const res = await fetch(`${API_BASE}/api/vote-records`, {
          cache: "no-store",
          credentials: "include",
        })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        if (Array.isArray(data)) {
          const filtered = data.filter((item): item is VoteRecord => {
            return (
              typeof item?.vote_id === "number" &&
              typeof item?.vote_date === "string" &&
              typeof item?.user_id === "number" &&
              typeof item?.election_name === "string" &&
              typeof item?.election_type_id === "number"
            )
          })
          setVoteRecords(filtered)
        }
      } catch {
        // 取得失敗時は空配列のまま
      } finally {
        if (mounted) setLoadingVotes(false)
      }
    }

    loadUser()
    loadVotes()

    return () => {
      mounted = false
    }
  }, [API_BASE])

  const filteredRecords = useMemo(() => {
    return userId
      ? voteRecords.filter((record) => record.user_id === userId)
      : voteRecords
  }, [userId, voteRecords])

  const sortedRecords = useMemo(() => [...filteredRecords].sort((a, b) => {
    const aTime = new Date(a.vote_date).getTime()
    const bTime = new Date(b.vote_date).getTime()
    return Number.isNaN(bTime) ? -1 : Number.isNaN(aTime) ? 1 : bTime - aTime
  }), [filteredRecords])

  const recentVotes = useMemo(() => sortedRecords.slice(0, 3), [sortedRecords])
  const voteCount = filteredRecords.length

  const avatarText = userName ? userName.slice(0, 2) : "？"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback>{avatarText}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userName}さん
              </h1>
              <Badge variant="secondary" className="mt-1">
                投票記録: {voteCount}件
              </Badge>
            </div>
          </div>
          <Link href="/logout">
            <Button variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </Link>
        </div>

        {/* Main Action - 投票記録登録 */}
        <div className="mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-blue-500 text-white">
            <Link href="/register">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Plus className="h-8 w-8 text-white" />
                  <div>
                    <CardTitle className="text-white text-xl">
                      投票記録登録
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      新しい投票記録を登録します
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* 最近の投票 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-purple-600" />
                <CardTitle>最近の投票</CardTitle>
              </div>
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  すべて見る
                </Button>
              </Link>
            </div>
            <CardDescription>最新の投票記録3件</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingVotes ? (
              <div className="text-sm text-gray-600">読み込み中...</div>
            ) : recentVotes.length === 0 ? (
              <div className="text-sm text-gray-600">
                まだ投票記録がありません。
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                {recentVotes.map((vote) => {
                  const candidateDisplay =
                    vote.candidate_name?.trim() || "候補者名未登録"
                  const partyDisplay = vote.party_name?.trim() || "党情報なし"
                  return (
                    <div
                      key={vote.vote_id}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Vote className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-semibold text-base text-gray-900">
                              {candidateDisplay}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <History className="w-3 h-3 mr-1" />
                            {vote.election_name}
                          </div>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <Building className="w-3 h-3 mr-1" />
                            {partyDisplay}
                          </div>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDisplayDate(vote.vote_date)}
                          </div>
                        </div>
                        <Link href={`/history/${vote.vote_id}`}>
                          <Button variant="outline" size="sm">
                            詳細
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <Link href="/history">
              <Button className="w-full bg-transparent" variant="outline">
                履歴一覧を見る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
