"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { WooCommerceOrder } from "@/types/woocommerce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
        if (data.length === 0) {
          toast({
            title: "No designs found",
            description: "Create your first design to get started",
            variant: "default",
          });
        }
      } else if (error) {
        toast({
          title: "Error loading designs",
          description: error.message,
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    fetchDesigns();
  }, [supabase, toast]);

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
    <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 p-4 md:pl-[78px]">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-4 rounded-full border border-purple-100 shadow-lg mb-8">
          <motion.div
            className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg"
            whileHover={{ rotate: 15 }}
          >
            <Sparkles className="w-7 h-7 text-purple-600" />
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Order Details
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Order Details Section */}
          <Card className="p-4 border min-h-[670px]">
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1 h-8 text-xs"
              />
              <Button 
                onClick={handleFetchOrder} 
                className="h-8 text-xs"
              >
                Fetch Order
              </Button>
            </div>

            {orderError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded text-red-600 text-xs">
                {orderError}
              </div>
            )}

            {orderDetails && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <Table className="min-w-full text-sm">
                    <TableBody>
                      {[
                        { label: 'Order Number', value: orderDetails.number },
                        { label: 'Status', value: orderDetails.status },
                        { label: 'Date', value: new Date(orderDetails.date_created).toLocaleString() },
                        { label: 'Total', value: `₹${orderDetails.total}` },
                        { label: 'Payment Method', value: orderDetails.payment_method_title },
                      ].map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium p-1">{item.label}</TableCell>
                          <TableCell className="p-1">{item.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Billing Address */}
                  <Card className="p-2 border">
                    <h4 className="font-semibold mb-1 text-xs">Billing Address</h4>
                    <div className="space-y-1 text-xs">
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
                  <Card className="p-2 border">
                    <h4 className="font-semibold mb-1 text-xs">Order Items</h4>
                    <div className="overflow-x-auto">
                      <Table className="min-w-full text-sm">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="p-1">Product</TableHead>
                            <TableHead className="p-1">Qty</TableHead>
                            <TableHead className="p-1">Price</TableHead>
                            <TableHead className="p-1">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderDetails.line_items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="p-1">{item.name}</TableCell>
                              <TableCell className="p-1">{item.quantity}</TableCell>
                              <TableCell className="p-1">₹{item.price}</TableCell>
                              <TableCell className="p-1">₹{item.total}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </Card>

          {/* Your Designs Section */}
          {loading ? (
            <Card className="p-4 border min-h-[670px] flex items-center justify-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ) : designs.length === 0 ? (
            <Card className="p-4 border min-h-[670px] flex flex-col items-center justify-center space-y-4">
              <div className="text-center space-y-2">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-800">No Designs Found</h3>
                <p className="text-sm text-gray-500">Create your first design to get started</p>
              </div>
              <Button 
                variant="outline" 
                className="border-purple-500 text-purple-500 hover:bg-purple-50"
                onClick={() => window.location.href = "/imagine"}
              >
                Create Design
              </Button>
            </Card>
          ) : (
            <Card className="p-4 border min-h-[670px]">
              <h2 className="text-xs font-semibold mb-2">Your Designs</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
                <Table className="min-w-full text-sm">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="p-2 w-12 font-medium text-gray-600">Select</TableHead>
                      <TableHead className="p-2 font-medium text-gray-600">Image</TableHead>
                      <TableHead className="p-2 font-medium text-gray-600">Customizations</TableHead>
                      <TableHead className="p-2 font-medium text-gray-600">Created</TableHead>
                      <TableHead className="p-2 w-20 font-medium text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designs.map((design) => (
                      <TableRow key={design.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="p-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            onChange={(e) => {
                              // Handle selection logic here
                            }}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <img 
                            src={design.public_url} 
                            alt="Design" 
                            className="w-12 h-12 object-cover rounded border shadow-sm"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="space-y-2">
                            {design.text1 && (
                              <div className="flex flex-col space-y-1 p-2 bg-gray-50 rounded">
                                <span className="text-xs font-medium text-gray-600">Text 1</span>
                                <span className="text-sm">{design.text1}</span>
                                <div className="text-xs text-gray-500">
                                  Font: {design.font1} | Color: {design.color1} | Size: {design.size1}
                                </div>
                              </div>
                            )}
                            {design.text2 && (
                              <div className="flex flex-col space-y-1 p-2 bg-gray-50 rounded">
                                <span className="text-xs font-medium text-gray-600">Text 2</span>
                                <span className="text-sm">{design.text2}</span>
                                <div className="text-xs text-gray-500">
                                  Font: {design.font2} | Color: {design.color2} | Size: {design.size2}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="text-sm text-gray-600">
                            {new Date(design.created_at).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this design?')) {
                                const { error } = await supabase
                                  .from('designs')
                                  .delete()
                                  .eq('id', design.id);
                                
                                if (!error) {
                                  setDesigns(prev => prev.filter(d => d.id !== design.id));
                                  toast({
                                    title: "Design deleted",
                                    description: "Your design has been successfully deleted",
                                    variant: "default",
                                  });
                                } else {
                                  toast({
                                    title: "Error deleting design",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
