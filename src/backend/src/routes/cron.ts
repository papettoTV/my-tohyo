import { Router } from "express"
import { getDataSource } from "../data-source"
import { autoUpdateManifesto } from "../services/manifestoAutoUpdater"
import { autoUpdateAchievement } from "../services/achievementAutoUpdater"

const router = Router()

/**
 * GET /api/cron/update-contents
 * Vercel Cron Job endpoint to update missing manifestos and achievements.
 */
router.get("/update-contents", async (req, res) => {
  // Security check: Vercel CRON_SECRET or local development bypass
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET

  if (process.env.NODE_ENV === "production" && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[cron] Unauthorized attempt to trigger update-contents")
      return res.status(401).json({ message: "Unauthorized" })
    }
  }

  console.log("[cron] Starting content update batch...")

  try {
    const ds = await getDataSource()

    // 1. Identify vote records that need updates
    // We look for records where either manifesto is missing/incomplete OR achievement is missing
    const records = await ds.query(`
      SELECT
        vr.vote_id,
        vr.candidate_name,
        vr.election_name,
        vr.vote_date,
        vr.party_id,
        c.candidate_id,
        COALESCE(p_vote.name, p.name) AS party_name,
        et.name AS election_type_name,
        m.status AS manifesto_status,
        a.content AS achievement_content
      FROM VOTE_RECORD vr
      LEFT JOIN CANDIDATE c ON LOWER(c.name) = LOWER(vr.candidate_name)
      LEFT JOIN PARTY p ON p.party_id = c.party_id
      LEFT JOIN PARTY p_vote ON p_vote.party_id = vr.party_id
      LEFT JOIN ELECTION_TYPE et ON et.election_type_id = vr.election_type_id
      LEFT JOIN CANDIDATE_CONTENT m
        ON (m.candidate_id = c.candidate_id OR (vr.candidate_name IS NULL AND m.party_id = vr.party_id))
       AND LOWER(m.election_name) = LOWER(vr.election_name)
       AND m.type = 'manifesto'
      LEFT JOIN CANDIDATE_CONTENT a
        ON (a.candidate_id = c.candidate_id OR (vr.candidate_name IS NULL AND a.party_id = vr.party_id))
       AND LOWER(a.election_name) = LOWER(vr.election_name)
       AND a.type = 'achievement'
      WHERE
        (
          (m.content_id IS NULL OR m.status != 'COMPLETE')
          OR
          (a.content_id IS NULL OR a.content IS NULL OR a.content = '')
        )
        AND vr.vote_date <= CURRENT_DATE - INTERVAL '1 month'
      LIMIT 50 -- Processing limit per run to avoid timeout
    `)

    console.log(`[cron] Found ${records.length} records needing updates.`)

    const results = {
      processed: 0,
      errors: 0,
    }

    for (const record of records) {
      try {
        const payload = {
          candidateId: record.candidate_id,
          candidateName: record.candidate_name,
          electionName: record.election_name,
          partyName: record.party_name,
          electionTypeName: record.election_type_name,
          voteDate: record.vote_date,
        }

        // Only update if candidateId is present (master candidate exists)
        if (record.candidate_id) {
          const promises = []

          // Check if manifesto needs update
          if (!record.manifesto_status || record.manifesto_status !== "COMPLETE") {
            promises.push(autoUpdateManifesto(payload))
          }

          // Check if achievement needs update
          if (!record.achievement_content || record.achievement_content.trim() === "") {
            promises.push(autoUpdateAchievement(payload))
          }

          if (promises.length > 0) {
            await Promise.all(promises)
            results.processed++
          }
        } else {
          console.warn(`[cron] Skipping record ${record.vote_id}: No candidate_id found for "${record.candidate_name}"`)
        }
      } catch (err) {
        console.error(`[cron] Failed to update record ${record.vote_id}:`, err)
        results.errors++
      }
    }

    console.log(`[cron] Batch completed: ${results.processed} processed, ${results.errors} errors.`)
    return res.json({
      message: "Batch completed",
      ...results
    })
  } catch (error) {
    console.error("[cron] batch failed:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
})

export default router
