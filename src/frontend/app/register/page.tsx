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

export default function RegisterPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [parties, setParties] = useState<{ party_id: number; name: string }[]>(
    []
  )
  const [selectedParty, setSelectedParty] = useState<string>("")

  useEffect(() => {
    async function loadParties() {
      try {
        const res = await fetch("http://localhost:3001/api/parties")
        if (!res.ok) throw new Error(`Failed to fetch parties: ${res.status}`)
        const data: { party_id: number; name: string }[] = await res.json()
        setParties(data)
      } catch (e) {
        console.error(e)
      }
    }
    loadParties()
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="選挙の種類を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house-representatives">
                      衆議院議員総選挙
                    </SelectItem>
                    <SelectItem value="house-councillors">
                      参議院議員通常選挙
                    </SelectItem>
                    <SelectItem value="governor">都道府県知事選挙</SelectItem>
                    <SelectItem value="mayor">市区町村長選挙</SelectItem>
                    <SelectItem value="local-assembly">
                      地方議会議員選挙
                    </SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Election Name */}
              <div className="space-y-2">
                <Label htmlFor="election-name">選挙名</Label>
                <Input
                  id="election-name"
                  placeholder="例: 第50回衆議院議員総選挙"
                />
              </div>

              {/* Political Party */}
              <div className="space-y-2">
                <Label htmlFor="party">政党名</Label>
                <Select value={selectedParty} onValueChange={setSelectedParty}>
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

              {/* Candidate Name */}
              <div className="space-y-2">
                <Label htmlFor="candidate">候補者名</Label>
                <Input id="candidate" placeholder="例: 山田花子" />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">メモ（任意）</Label>
                <Textarea
                  id="notes"
                  placeholder="投票理由や感想など..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  登録する
                </Button>
                <Link href="/mypage" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    キャンセル
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
