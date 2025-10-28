// 投票履歴
import { Manifesto } from "./Manifesto"
import { Achievement } from "./Achievement"

export interface VoteRecord {
  vote_id: number
  user_id: number
  candidate_id?: number | null
  candidate_name: string | null
  election_name: string
  election_type_id: number
  vote_date: string // ISO8601形式の日付文字列
  photo_url?: string | null
  social_post_url?: string | null
  notes?: string | null
  party_name?: string | null
  manifesto?: Manifesto | null
  achievement?: Achievement | null
}
