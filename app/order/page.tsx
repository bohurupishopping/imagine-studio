"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { WooCommerceOrder } from "@/types/woocommerce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

type Design = {
  id: string;
  user_id: string;
  
  public_url: string;
  
  created_at: string;
  updated_at: string;
  text1?: string;
  text2?: string;
  font1?: string;
  font2?: string;
  color1?: string;
  color2?: string;
  size1?: number;
  size2?: number;
};

export default function OrderPage() {
  const supabase = createClientComponentClient();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) {
        setDesigns(data);
      }
      setLoading(false);
    };

    fetchDesigns();
  }, [supabase]);

  const [orderDetails, setOrderDetails] = useState<WooCommerceOrder | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handleFetchOrder = async () => {
    if (!orderId) {
      setOrderError("Please enter an order ID");
      return;
    }

    setOrderError(null);
    setOrderDetails(null);

    try {
      const response = await fetch(`/api/woocommerce/orders/${orderId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch order");
      }

      const order = await response.json();
      setOrderDetails(order);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Failed to fetch order");
    }
  };

  const handlePlaceOrder = async () => {
    if (!orderDetails) {
      setOrderError("Please fetch order details first");
      return;
    }

    if (!designs.length) {
      setOrderError("No designs found to associate with order");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Combine order and design data
      const orderData = {
        order_id: orderDetails.id,
        user_id: user.id,
        order_data: orderDetails,
        designs: designs.map(design => ({
          id: design.id,
          public_url: design.public_url,
          customizations: {
            text1: design.text1,
            text2: design.text2,
            font1: design.font1,
            font2: design.font2,
            color1: design.color1,
            color2: design.color2,
            size1: design.size1,
            size2: design.size2
          }
        })),
        created_at: new Date().toISOString()
      };

      // Save to orders table
      const { error } = await supabase
        .from("orders")
        .insert(orderData);

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to confirmation page
      window.location.href = "/order/confirmation";
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Failed to place order");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <Input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button onClick={handleFetchOrder} className="w-full">
          Fetch Order Details
        </Button>

        {orderError && (
          <div className="mt-4 text-red-500">{orderError}</div>
        )}

        {orderDetails && (
          <div className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold">Order Details</h3>
            
            {/* Order Summary Table */}
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Order Number</TableCell>
                  <TableCell>{orderDetails.number}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Status</TableCell>
                  <TableCell>{orderDetails.status}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Date</TableCell>
                  <TableCell>
                    {new Date(orderDetails.date_created).toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell>₹{orderDetails.total}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Payment Method</TableCell>
                  <TableCell>{orderDetails.payment_method_title}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Billing Address */}
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Billing Address</h4>
              <div className="space-y-1">
                <div>{orderDetails.billing.first_name} {orderDetails.billing.last_name}</div>
                <div>{orderDetails.billing.address_1}</div>
                {orderDetails.billing.address_2 && <div>{orderDetails.billing.address_2}</div>}
                <div>{orderDetails.billing.city}, {orderDetails.billing.state} {orderDetails.billing.postcode}</div>
                <div>{orderDetails.billing.country}</div>
                <div>Email: {orderDetails.billing.email}</div>
                <div>Phone: {orderDetails.billing.phone}</div>
              </div>
            </Card>

            {/* Line Items Table */}
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Order Items</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.line_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.price}</TableCell>
                      <TableCell>₹{item.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </Card>

      {loading ? (
        <div>Loading designs...</div>
      ) : (
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Your Designs</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Customizations</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designs.map((design) => (
                <TableRow key={design.id}>
                  <TableCell>
                    <img 
                      src={design.public_url} 
                      alt="Design" 
                      className="w-20 h-20 object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      
                      {design.text1 && (
                        <div>
                          Text 1: {design.text1}
                          <span className="ml-2 text-sm text-gray-500">
                            ({design.font1}, {design.color1}, size {design.size1})
                          </span>
                        </div>
                      )}
                      {design.text2 && (
                        <div>
                          Text 2: {design.text2}
                          <span className="ml-2 text-sm text-gray-500">
                            ({design.font2}, {design.color2}, size {design.size2})
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(design.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
