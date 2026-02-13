import "reflect-metadata"

import { User } from "@/lib/db/models/User"
import { SocialAccount } from "@/lib/db/models/SocialAccount"
import { ElectionType } from "@/lib/db/models/ElectionType"
import { Party } from "@/lib/db/models/Party"
import { Candidate } from "@/lib/db/models/Candidate"
import { CandidateContent } from "@/lib/db/models/CandidateContent"
import { VoteRecord } from "@/lib/db/models/VoteRecord"

export {
  User,
  SocialAccount,
  ElectionType,
  Party,
  Candidate,
  CandidateContent,
  VoteRecord,
}
