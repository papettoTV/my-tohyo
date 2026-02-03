// 投票履歴
export interface VoteRecord {
  vote_id: number
  user_id: number
  candidate_id?: number | null
  candidate_name: string | null
  election_id: number
  election_name?: string
  election_type_id: number
  election_type_name?: string
  vote_date: string // ISO8601形式の日付文字列
  photo_url?: string | null
  social_post_url?: string | null
  notes?: string | null
  party_id?: number | null
  party_name?: string | null
  manifesto?: any | null
  achievement?: any | null
}
