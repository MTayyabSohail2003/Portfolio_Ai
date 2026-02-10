import { google } from "googleapis";

export async function bookMeeting({
  email,
  name,
  datetime,
  topic,
}: {
  email: string;
  name: string;
  datetime: string;
  topic?: string;
}) {
  console.log(
    `[Calendar Service] Booking meeting for ${name} (${email}) at ${datetime}...`
  );

  // Parse credentials from Env
  const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccount) {
    console.warn("[Calendar Service] Missing GOOGLE_SERVICE_ACCOUNT_JSON");
    // Only fail if we really can't proceed.
    // In strict production, this is a failure.
    return {
      success: false,
      message:
        "The meeting tool is currently disabled (Missing Credentials). Please contact Muhammad Tayyab directly via email.",
    };
  }

  try {
    const credentials = JSON.parse(serviceAccount);

    // Auth client
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // 0. Determine Target Calendar ID
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

    // 1. Check Availability (FreeBusy)
    const endDateTime = new Date(
      new Date(datetime).getTime() + 30 * 60000
    ).toISOString();

    const freeBusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: datetime,
        timeMax: endDateTime,
        items: [{ id: calendarId }],
      },
    });

    const busySlots = freeBusyRes.data.calendars?.[calendarId]?.busy;
    if (busySlots && busySlots.length > 0) {
      console.warn(
        `[Calendar Service] Slot busy: ${datetime} - ${endDateTime}`
      );
      return {
        success: false,
        message:
          "This time slot is already booked. Please choose another time.",
      };
    }

    // 2. Create Event
    const event = {
      summary: `Consultation with ${name} ${topic ? `(${topic})` : ""}`,
      description: `Meeting booked via AI Agent.\nAttendee: ${name} (${email})`,
      start: {
        dateTime: datetime, // Ensure ISO format from tools
        timeZone: "UTC", // or user timezone
      },
      end: {
        dateTime: endDateTime,
        timeZone: "UTC",
      },
      attendees: [{ email }],
    };

    // Insert into specific calendar
    const res = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
      sendUpdates: "all",
    });

    console.log("[Calendar Service] Event created:", res.data.htmlLink);

    return {
      success: true,
      message: `Meeting booked successfully! Calendar invite sent to ${email}.`,
      link: res.data.htmlLink,
    };
  } catch (error: any) {
    console.error("[Calendar Service] Error:", error);
    return {
      success: false,
      message: `Failed to book meeting: ${error.message}`,
    };
  }
}
