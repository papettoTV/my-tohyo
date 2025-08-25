// 投票履歴
export interface VoteRecord {
  vote_id: number
  user_id: number
  election_id: number
  candidate_name: string | null
  vote_date: string // ISO8601形式の日付文字列
  photo_url?: string | null
  notes?: string | null
}
