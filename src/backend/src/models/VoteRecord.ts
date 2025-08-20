export interface VoteRecord {
  vote_id: number
  user_id: number
  vote_date: string // ISO8601形式の日付文字列
  election_type_id: number
  election_name: string
  party_id: number
  candidate_id: number
  notes?: string | null
}
