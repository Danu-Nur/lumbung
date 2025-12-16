import { getQueue } from "@/lib/performance/queue";
import { sendEmail } from "@/lib/email";
import { EMAIL_JOB_NAME, EmailJobData } from "@/lib/workers/emailWorker";

export class NotificationService {
    private queue = getQueue();
    private useQueue = process.env.EMAIL_DELIVERY_MODE === "queue";

    /**
     * Send an email notification.
     * If EMAIL_DELIVERY_MODE is 'queue', it enqueues the job.
     * Otherwise, it sends immediately.
     */
    async sendEmail(to: string, subject: string, html: string) {
        if (this.useQueue) {
            console.log(`[Notification] Enqueuing email to ${to}`);
            await this.queue.enqueue<EmailJobData>(EMAIL_JOB_NAME, {
                to,
                subject,
                html,
            });
        } else {
            console.log(`[Notification] Sending email inline to ${to}`);
            await sendEmail({ to, subject, html });
        }
    }

    /**
     * Send low stock alert
     */
    async sendLowStockAlert(email: string, productName: string, currentStock: number, threshold: number, warehouseName: string) {
        // Check user preferences
        // We dynamically import prisma to avoid circular dependencies if any, 
        // and to ensure we get the fresh instance.
        const { prisma } = await import("@/lib/prisma");

        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (user as any).preferences) {
            const prefs = (user as any).preferences;
            if (prefs.notifications?.lowStock === false) {
                console.log(`[Notification] Skipped low stock alert for ${email} due to user preference.`);
                return;
            }
        }

        const subject = `Low Stock Alert: ${productName}`;
        const html = `
      <h1>Low Stock Alert</h1>
      <p>Product <strong>${productName}</strong> is running low in <strong>${warehouseName}</strong>.</p>
      <p>Current Stock: <strong>${currentStock}</strong></p>
      <p>Threshold: <strong>${threshold}</strong></p>
      <p>Please restock soon.</p>
    `;
        await this.sendEmail(email, subject, html);
    }
}

export const notificationService = new NotificationService();
