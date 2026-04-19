import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const booking = await prisma.demoBooking.create({
      data: {
        name: name.trim(),
        business: business.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        challenge: challenge?.trim() || null,
      },
    });

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
    const bookings = await prisma.demoBooking.findMany({
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
