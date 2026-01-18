import { getDataSource } from "../src/data-source";
import { scheduleAchievementAutoUpdate } from "../src/services/achievementAutoUpdater";

async function main() {
    const ds = await getDataSource();
    console.log("Connected to DB");

    const testPayload = {
        candidateId: 99999, // Dummy ID
        candidateName: "TestCandidate_Verification",
        electionName: "TestElection_Verification",
        electionTypeName: "TestType",
        partyName: "TestParty",
        voteDate: new Date().toISOString()
    };

    // Ensure dummy candidate exists
    await ds.query(
        "INSERT INTO CANDIDATE (candidate_id, name) VALUES ($1, $2) ON CONFLICT (candidate_id) DO UPDATE SET name = EXCLUDED.name",
        [testPayload.candidateId, testPayload.candidateName]
    );
    console.log("Ensured dummy candidate exists");

    // Clean up previous test run
    await ds.query("DELETE FROM ACHIEVEMENT WHERE candidate_id = $1", [testPayload.candidateId]);
    console.log("Cleaned up old test data");

    // Manually trigger the logic (wrapper around the async function for testing)
    // We cannot access the internal function easily, but scheduleAchievementAutoUpdate just calls setTimeout.
    // We can't wait for setTimeout in a script easily unless we mock it or expose the inner function.
    // Actually, I should probably expose the inner function for testing or just copy-paste the body for this test since I can't change the source easily just for testing.
    
    // Better approach: Import the function if it was exported.
    // Looking at achievementAutoUpdater.ts:
    // export function scheduleAchievementAutoUpdate(payload: AutoUpdatePayload) { ... }
    // async function autoUpdateAchievement(payload: AutoUpdatePayload) { ... }
    
    // The inner function is not exported.
    // I will use a trick: `scheduleAchievementAutoUpdate` sets a timeout of 0.
    // So if I call it, then wait a bit, it should run.
    
    console.log("Scheduling update...");
    scheduleAchievementAutoUpdate(testPayload);

    // Wait for async operation (simulating wait)
    console.log("Waiting for async operation...");
    await new Promise(r => setTimeout(r, 10000)); // Wait 10s for LLM (might fail if no key, but logic should try)

    // Check DB
    const rows = await ds.query("SELECT * FROM ACHIEVEMENT WHERE candidate_id = $1", [testPayload.candidateId]);
    console.log("Rows found:", rows.length);
    if (rows.length > 0) {
        console.log("Success! Row found:", rows[0]);
    } else {
        console.log("Failure! No row found. Check logs for errors (LLM might have failed if no key).");
    }

    await ds.destroy();
}

main().catch(console.error);
