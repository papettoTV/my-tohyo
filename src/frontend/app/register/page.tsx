"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, ArrowLeft, Save } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:3001"
  const [date, setDate] = useState<Date>(new Date())
  const [parties, setParties] = useState<{ party_id: number; name: string }[]>(
    []
  )
  const [selectedParty, setSelectedParty] = useState<string>("")
  const [electionTypes, setElectionTypes] = useState<
    { election_type_id: number; name: string }[]
  >([])
  const [selectedElectionType, setSelectedElectionType] = useState<string>("")

  // Inputs for submission
  const [electionName, setElectionName] = useState<string>("")
  const [candidateName, setCandidateName] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [socialUrl, setSocialUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"))
    }
    async function loadParties() {
      try {
        const res = await fetch(`${API_BASE}/api/parties`)
        if (!res.ok) throw new Error(`Failed to fetch parties: ${res.status}`)
        const data: { party_id: number; name: string }[] = await res.json()
        setParties(data)
      } catch (e) {
        console.error(e)
      }
    }
    async function loadElectionTypes() {
      try {
        const res = await fetch(`${API_BASE}/api/election-types`)
        if (!res.ok)
          throw new Error(`Failed to fetch election types: ${res.status}`)
        const data: { election_type_id: number; name: string }[] =
          await res.json()
        setElectionTypes(data)
      } catch (e) {
        console.error(e)
      }
    }
    loadParties()
    loadElectionTypes()
  }, [API_BASE])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const vote_date = date ? format(date, "yyyy-MM-dd") : null
    const election_type_id = selectedElectionType
      ? Number(selectedElectionType)
      : null

    if (!vote_date) {
      toast({ title: "エラー", description: "選挙日を選択してください" })
      setLoading(false)
      return
    }

    if (!selectedParty) {
      alert("政党名を選択してください")
      setLoading(false)
      return
    }

    // Validate SNS URL if provided
    if (socialUrl && socialUrl.trim() !== "") {
      try {
        // use URL constructor for basic validation
        new URL(socialUrl.trim())
      } catch {
        toast({
          title: "エラー",
          description: "SNS投稿URLが有効なURLではありません",
        })
        setLoading(false)
        return
      }
    }

    try {
      if (!token) {
        toast({ title: "エラー", description: "認証情報が見つかりません" })
        setLoading(false)
        return
      }

      const partyIdValue = selectedParty ? Number(selectedParty) : null
      const partyNameValue = selectedParty
        ? parties.find((p) => String(p.party_id) === selectedParty)?.name?.trim() || ""
        : ""

      const res = await fetch(`${API_BASE}/api/vote-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vote_date,
          election_type_id: election_type_id,
          election_name: electionName ? electionName.trim() : "",
          candidate_name: candidateName.trim(),
          party_id: partyIdValue,
          party_name: partyNameValue || null,
          social_post_url: socialUrl ? socialUrl.trim() : null,
          photo_url: null,
          notes: notes || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const voteId = data.vote_id
        router.push(`/history/${voteId}`)
        return
      }

      let errMsg = `登録に失敗しました (${res.status})`
      try {
        const errBody = await res.json()
        if (errBody && errBody.message) errMsg = errBody.message
      } catch {
        // ignore parse errors
      }
      toast({ title: "登録失敗", description: errMsg })
    } catch (err) {
      console.error("Failed to submit:", err)
      toast({
        title: "通信エラー",
        description: "登録中に通信エラーが発生しました",
      })
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">投票記録登録</h1>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>新しい投票記録を登録</CardTitle>
              <CardDescription>
                投票した選挙の詳細情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Election Date */}
                <div className="space-y-2">
                  <Label htmlFor="election-date">選挙日</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date
                          ? format(date, "PPP", { locale: ja })
                          : "日付を選択"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Election Type */}
                <div className="space-y-2">
                  <Label htmlFor="election-type">選挙の種類</Label>
                  <Select
                    value={selectedElectionType}
                    onValueChange={setSelectedElectionType}
                  >
                    <SelectTrigger id="election-type">
                      <SelectValue placeholder="選挙の種類を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {electionTypes.map((et) => (
                        <SelectItem
                          key={et.election_type_id}
                          value={String(et.election_type_id)}
                        >
                          {et.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-gray-500">
                  選挙は上の「選挙の種類」から選択してください。リストにない場合は下の「選挙名」を入力してください。
                </div>

                {/* Election Name (informational) */}
                <div className="space-y-2">
                  <Label htmlFor="election-name">選挙名</Label>
                  <Input
                    id="election-name"
                    placeholder="例: 第50回衆議院議員総選挙"
                    value={electionName}
                    onChange={(ev) => setElectionName(ev.target.value)}
                  />
                </div>

                {/* Party */}
                <div className="space-y-2">
                  <Label htmlFor="party">政党名</Label>
                  <Select
                    value={selectedParty}
                    onValueChange={setSelectedParty}
                  >
                    <SelectTrigger id="party">
                      <SelectValue placeholder="政党を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((p) => (
                        <SelectItem key={p.party_id} value={String(p.party_id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Candidate Name (free text) */}
                <div className="space-y-2">
                  <Label htmlFor="candidate">候補者名（任意）</Label>
                  <Input
                    id="candidate"
                    placeholder="例: 山田花子"
                    value={candidateName}
                    onChange={(ev) => setCandidateName(ev.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">メモ（任意）</Label>
                  <Textarea
                    id="notes"
                    placeholder="投票理由や感想など..."
                    rows={3}
                    value={notes}
                    onChange={(ev) => setNotes(ev.target.value)}
                  />
                </div>

                {/* SNS投稿URL（任意） */}
                <div className="space-y-2">
                  <Label htmlFor="social-url">SNS投稿URL（任意）</Label>
                  <Input
                    id="social-url"
                    placeholder="例: https://twitter.com/username/status/1234567890"
                    value={socialUrl}
                    onChange={(ev) => setSocialUrl(ev.target.value)}
                  />
                  <div className="text-sm text-gray-500">
                    SNSに投稿した投稿のURLを貼り付けてください（任意）
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/mypage" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      キャンセル
                    </Button>
                  </Link>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "登録中..." : "登録する"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
