import { NextResponse, NextRequest } from "next/server";
import { WooCommerceOrder } from "@/types/woocommerce";

const CONSUMER_KEY = process.env.WOO_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOO_CONSUMER_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    return NextResponse.json(
      { error: "Missing WooCommerce credentials" },
      { status: 500 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required" },
      { status: 400 }
    );
  }

  try {
    const url = new URL('https://bohurupi.com/wp-json/wc/v3/orders');
    url.searchParams.append('email', email);
    url.searchParams.append('consumer_key', CONSUMER_KEY);
    url.searchParams.append('consumer_secret', CONSUMER_SECRET);
    url.searchParams.append('status', 'processing');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch orders",
          code: errorData.code || "unknown_error"
        },
        { status: response.status }
      );
    }

    const orders: WooCommerceOrder[] = await response.json();
    
    if (!Array.isArray(orders)) {
      return NextResponse.json(
        { error: "Invalid orders data received from API" },
        { status: 500 }
      );
    }
    
    // Filter to only include processing orders
    const processingOrders = orders.filter(
      (order) => order.status === "processing"
    );

    return NextResponse.json(processingOrders);
  } catch (error) {
    console.error("Error fetching orders by email:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching orders" },
      { status: 500 }
    );
  }
}