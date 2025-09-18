"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Calendar, Vote, Eye, Filter } from "lucide-react"
import Link from "next/link"

type VoteRecord = {
  vote_id: number
  vote_date: string
  photo_url?: string | null
  social_post_url?: string | null
  user_id: number
  election_id: number
  candidate_name?: string | null
}

function SocialImage({
  photoUrl,
  socialUrl,
  alt = "投票写真",
  className = "w-32 h-20 object-cover rounded",
}: {
  photoUrl?: string | null
  socialUrl?: string | null
  alt?: string
  className?: string
}) {
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true

    // If backend provided a direct photo_url, prefer and validate it.
    if (photoUrl) {
      const img = new Image()
      img.onload = () => {
        if (mounted) setSrc(photoUrl)
      }
      img.onerror = () => {
        if (mounted) setSrc(null)
      }
      img.src = photoUrl
      return () => {
        mounted = false
      }
    }

    if (!socialUrl) {
      if (mounted) setSrc(null)
      return () => {
        mounted = false
      }
    }

    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    setLoading(true)

    fetch(`${base}/api/social-image?url=${encodeURIComponent(socialUrl)}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Status ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        const candidate =
          data && data.imageUrl ? (data.imageUrl as string) : socialUrl

        const img = new Image()
        img.onload = () => {
          if (mounted) setSrc(candidate)
        }
        img.onerror = () => {
          if (mounted) setSrc(null)
        }
        img.src = candidate
      })
      .catch((e) => {
        console.error("Failed to fetch social image:", e)
        if (mounted) setSrc(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [photoUrl, socialUrl])

  if (!src) {
    return (
      <div
        className={
          "w-32 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 " +
          className.replace(/w-[^\s]+ ?/, "").replace(/h-[^\s]+ ?/, "")
        }
      >
        写真なし
      </div>
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />
}

export default function HistoryPage() {
  const [records, setRecords] = useState<VoteRecord[] | null | undefined>(
    undefined
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    setRecords(undefined)
    setError(null)
    fetch(`${base}/api/vote-records`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        setRecords(data as VoteRecord[])
      })
      .catch((e) => {
        console.error("Failed to fetch vote records:", e)
        if (mounted) {
          setError(String(e))
          setRecords(null)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/mypage">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              マイページに戻る
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">過去の投票履歴</h1>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="候補者名、政党名で検索..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                フィルター
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          {records === undefined && (
            <div className="text-center py-12 text-gray-600">読み込み中...</div>
          )}

          {records === null && (
            <div className="text-center py-12">
              <p className="text-gray-600">履歴が取得できませんでした。</p>
              {error && (
                <p className="text-xs text-red-600 mt-2">エラー: {error}</p>
              )}
            </div>
          )}

          {Array.isArray(records) &&
            records.map((record) => (
              <Card
                key={record.vote_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {record.vote_date}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">
                        {record.candidate_name || "—"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Vote className="w-4 h-4 mr-1" />
                          {record.candidate_name}
                        </div>
                        <span>(投票ID: {record.vote_id})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <SocialImage
                        photoUrl={record.photo_url}
                        socialUrl={record.social_post_url}
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="flex flex-col gap-2">
                        <Link href={`/history/${record.vote_id}`}>
                          <Button size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            詳細
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Pagination or Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">さらに読み込む</Button>
        </div>
      </div>
    </div>
  )
}
