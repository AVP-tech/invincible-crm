import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, business, phone, email, challenge } = body;

    // Basic validation
    if (!name || !business || !phone || !email) {
      return NextResponse.json(
        { error: "Name, business, phone, and email are required." },
        { status: 400 }
      );
    }

    const booking = await db.demoBooking.create({
      data: {
        name: name.trim(),
        business: business.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        challenge: challenge?.trim() || null,
      },
    });

    // Send Discord notification if webhook URL exists
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: "🎉 New Demo Booking!",
                color: 15122730, // Invincible Gold
                fields: [
                  { name: "Name", value: booking.name, inline: true },
                  { name: "Business", value: booking.business, inline: true },
                  { name: "Email", value: booking.email, inline: true },
                  { name: "Phone", value: booking.phone, inline: true },
                  { name: "Challenge", value: booking.challenge || "N/A" },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });
      } catch (err) {
        console.error("[book-demo] Failed to send Discord notification:", err);
      }
    }

    return NextResponse.json({ success: true, id: booking.id }, { status: 201 });
  } catch (error) {
    console.error("[book-demo] Failed to save booking:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// GET: List all bookings (admin only — requires auth)
export async function GET() {
  try {
    const bookings = await db.demoBooking.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("[book-demo] Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}
