import { NextResponse, NextRequest } from "next/server";
import { WooCommerceOrder } from "@/types/woocommerce";

const CONSUMER_KEY = process.env.WOO_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOO_CONSUMER_SECRET;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    return NextResponse.json(
      { error: "Missing WooCommerce credentials" },
      { status: 500 }
    );
  }

  try {
    const url = `https://bohurupi.com/wp-json/wc/v3/orders/${id}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: response.status }
      );
    }

    const order: WooCommerceOrder = await response.json();

    // Validate order status - only reject failed orders
    if (order.status === "failed") {
      return NextResponse.json(
        { error: "Order payment failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching the order" },
      { status: 500 }
    );
  }
}
