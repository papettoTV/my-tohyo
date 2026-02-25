import { AppDataSource } from "../src/data-source";
import { CandidateContent } from "../src/models/CandidateContent";

async function cleanup() {
  console.log("Starting database cleanup...");
  
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database initialized.");
    }

    const repository = AppDataSource.getRepository(CandidateContent);
    const contents = await repository.find();

    console.log(`Found ${contents.length} records to process.`);

    let updateCount = 0;

    for (const record of contents) {
      if (record.content_format === "html" && record.content) {
        // Remove class, className, and style attributes
        // Regex to match class="..." or className="..." or style="..."
        // This handles single and double quotes
        const cleanedContent = record.content
          .replace(/\s(class|className|style)=(['"])[^'"]*\2/gi, "")
          .replace(/\s(class|className|style)=([^\s'">]+)/gi, ""); // Handle unquoted if any

        if (cleanedContent !== record.content) {
          record.content = cleanedContent;
          await repository.save(record);
          updateCount++;
        }
      }
    }

    console.log(`Cleanup completed. Updated ${updateCount} records.`);
  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed.");
    }
  }
}

cleanup();
