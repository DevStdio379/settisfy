const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const logger = require("firebase-functions/logger");

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

exports.onBookingStatusUpdate = onDocumentUpdated("bookings/{bookingId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  // Only proceed if the status actually changed
  if (before.status === after.status) return;

  const userId = after.userId;
  const status = after.status;

  let messageBody = "";
  if (status === 0) messageBody = "Your booking has been approved!";
  else if (status === 1) messageBody = "Your booking has been rejected.";
  else return; // Unknown status → no notification

  try {
    // Get user's FCM tokens array
    const userSnap = await db.collection("users").doc(userId).get();
    const userData = userSnap.data();

    if (!userData || !userData.fcmTokens || userData.fcmTokens.length === 0) {
      logger.warn(`No FCM tokens for user: ${userId}`);
      return;
    }

    const tokens = userData.fcmTokens;

    // Send notification to all tokens
    const messagePromises = tokens.map((token) =>
      messaging.send({
        token: token,
        notification: {
          title: "Booking Update",
          body: messageBody,
        },
      })
    );

    await Promise.all(messagePromises);
    logger.info(`Sent booking status notification to ${userId}: ${messageBody}`);
  } catch (error) {
    logger.error("Error sending notification:", error);
  }
});
