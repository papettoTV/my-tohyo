import { getDataSource } from "../src/data-source";
import { scheduleManifestoAutoUpdate } from "../src/services/manifestoAutoUpdater";

async function main() {
    const ds = await getDataSource();
    console.log("Connected to DB");

    const testPayload = {
        candidateId: 99998, // Separate Dummy ID from achievement test
        candidateName: "TestCandidate_Manifesto_Verification",
        electionName: "TestElection_Manifesto_Verification",
        electionTypeName: "TestType_Manifesto",
        partyName: "TestParty_Manifesto",
        voteDate: new Date().toISOString()
    };

    // Ensure dummy candidate exists
    await ds.query(
        "INSERT INTO CANDIDATE (candidate_id, name) VALUES ($1, $2) ON CONFLICT (candidate_id) DO UPDATE SET name = EXCLUDED.name",
        [testPayload.candidateId, testPayload.candidateName]
    );
    console.log("Ensured dummy candidate exists");

    // Clean up previous test run in CANDIDATE_CONTENT
    await ds.query(
        "DELETE FROM CANDIDATE_CONTENT WHERE candidate_id = $1 AND type = 'manifesto'",
        [testPayload.candidateId]
    );
    console.log("Cleaned up old test data (manifesto)");

    console.log("Scheduling manifesto update...");
    scheduleManifestoAutoUpdate(testPayload);

    // Wait for async operation (simulating wait)
    // manifesto generation usually involves LLM web search if CALL_PROMPT_FLG=true
    console.log("Waiting for async operation (15s)...");
    await new Promise(r => setTimeout(r, 15000)); 

    // Check DB
    const rows = await ds.query(
        "SELECT * FROM CANDIDATE_CONTENT WHERE candidate_id = $1 AND type = 'manifesto'",
        [testPayload.candidateId]
    );
    
    console.log("Rows found:", rows.length);
    if (rows.length > 0) {
        console.log("Success! Row found:", JSON.stringify(rows[0], null, 2));
    } else {
        console.log("Failure! No row found. Check backend logs for errors.");
        console.log("Keep in mind CALL_PROMPT_FLG must be 'true' for LLM generation, otherwise dummy data is used.");
    }

    await ds.destroy();
}

main().catch(console.error);
