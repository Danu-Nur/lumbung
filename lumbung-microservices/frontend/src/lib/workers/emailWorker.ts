import { getQueue } from "@/lib/performance/queue";
import { sendEmail } from "@/lib/email";
import { QueueJob } from "@/lib/performance/types";

const queue = getQueue();

export const EMAIL_JOB_NAME = "email-delivery";

export interface EmailJobData {
    to: string;
    subject: string;
    html: string;
}

// Register the worker handler
// This should be called when the app starts (e.g. in instrumentation.ts or a separate worker process)
export function startEmailWorker() {
    console.log("[Worker] Starting Email Worker...");

    queue.process(EMAIL_JOB_NAME, async (job: QueueJob<EmailJobData>) => {
        console.log(`[Worker] Processing email job ${job.id} to ${job.data.to}`);
        try {
            await sendEmail({
                to: job.data.to,
                subject: job.data.subject,
                html: job.data.html,
            });
            console.log(`[Worker] Email job ${job.id} completed`);
        } catch (error) {
            console.error(`[Worker] Email job ${job.id} failed`, error);
            throw error; // Let the queue handle retries
        }
    });
}
