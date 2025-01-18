"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "../../components/ui/visually-hidden";
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

    // Validate order status
    if (!['completed', 'processing'].includes(orderDetails.status)) {
      setOrderError("Only paid orders can be processed");
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

      // Structure woocommerce_order data
      const woocommerceOrder = {
        id: orderDetails.id,
        parent_id: orderDetails.parent_id,
        number: orderDetails.number,
        status: orderDetails.status,
        date_created: orderDetails.date_created,
        total: orderDetails.total,
        billing: {
          first_name: orderDetails.billing.first_name,
          last_name: orderDetails.billing.last_name,
          email: orderDetails.billing.email,
          phone: orderDetails.billing.phone
        },
        line_items: orderDetails.line_items.map(item => ({
          id: item.id,
          name: item.name,
          product_id: item.product_id,
          variation_id: item.variation_id,
          quantity: item.quantity
        }))
      };

      // Get text customization from first design
      const design = designs[0];
      const textCustomization = {
        text1: design.text1,
        text2: design.text2,
        font1: design.font1,
        font2: design.font2,
        color1: design.color1,
        color2: design.color2,
        size1: design.size1,
        size2: design.size2
      };

      // Prepare order data
      const orderData = {
        user_id: user.id,
        design_id: design.id,
        image_url: design.public_url,
        text_customization: textCustomization,
        woocommerce_order: woocommerceOrder,
        status: 'pending'
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
    <div className="bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 p-4 md:pl-[78px] min-h-screen backdrop-blur-sm">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="py-8 md:py-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Order Creation
          </h1>
          <p className="mt-3 text-center text-gray-600/90 text-sm md:text-base">
            Place your customization order from bohurupi.com
          </p>
          <motion.div
            className="flex justify-center mt-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Order Details Section */}
          <Card className="p-6 border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="flex-1 h-9 text-sm bg-white/80 border-gray-200/80 focus:border-purple-300 focus:ring-purple-200"
                />
                <Button
                  onClick={handleFetchOrder}
                  className="h-9 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Fetch Order
                </Button>
              </div>
            </div>

            {orderError && (
              <div className="mb-3 p-3 bg-red-50/80 backdrop-blur-sm border-l-4 border border-red-200 border-l-red-500 rounded-lg text-red-600 text-sm">
                {orderError}
              </div>
            )}

            {orderDetails && (
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-lg border border-gray-100/80 shadow-sm">
                  <Table className="min-w-full text-sm bg-white/60 backdrop-blur-sm">
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
                  {/* Billing Address - Compact Mobile Version */}
                  <Card className="p-3 md:p-4 border border-white/40 bg-white/90 backdrop-blur-md rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:border-purple-200">
                    <h4 className="font-semibold mb-2 text-xs md:text-sm bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path className="text-purple-600" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle className="text-purple-600" cx="12" cy="10" r="3"/>
                      </svg>
                      Billing
                    </h4>
                    <div className="text-xs md:text-sm text-gray-700/90 space-y-2">
                      <div className="truncate">{orderDetails.billing.first_name} {orderDetails.billing.last_name}</div>
                      <div className="hidden md:block">{orderDetails.billing.address_1}</div>
                      {orderDetails.billing.address_2 && (
                        <div className="hidden md:block">{orderDetails.billing.address_2}</div>
                      )}
                      <div className="truncate">{orderDetails.billing.city}, {orderDetails.billing.postcode}</div>
                      <div className="hidden md:block">{orderDetails.billing.country}</div>
                      <div className="truncate">📧 {orderDetails.billing.email}</div>
                      <div className="truncate">📞 {orderDetails.billing.phone}</div>
                    </div>
                  </Card>

                  {/* Order Items - Compact Mobile Version */}
                  <Card className="p-2 md:p-4 border bg-white backdrop-blur-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:border-purple-200">
                    <h4 className="font-semibold mb-1 text-xs md:text-sm text-purple-600">Items</h4>
                    <div className="overflow-x-auto">
                      <Table className="min-w-full text-xs md:text-sm">
                        <TableHeader className="hidden md:table-header-group">
                          <TableRow>
                            <TableHead className="p-1">Product</TableHead>
                            <TableHead className="p-1">Qty</TableHead>
                            <TableHead className="p-1">Price</TableHead>
                            <TableHead className="p-1">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderDetails.line_items.map((item) => (
                            <TableRow key={item.id} className="flex flex-col md:table-row">
                              <TableCell className="p-1 font-medium md:font-normal">
                                {item.name}
                              </TableCell>
                              <TableCell className="p-1 text-gray-600">
                                <span className="md:hidden">Qty: </span>{item.quantity}
                              </TableCell>
                              <TableCell className="p-1 text-gray-600">
                                <span className="md:hidden">Price: </span>₹{item.price}
                              </TableCell>
                              <TableCell className="p-1 text-gray-600">
                                <span className="md:hidden">Total: </span>₹{item.total}
                              </TableCell>
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
            <Card className="p-6 border bg-white backdrop-blur-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:border-purple-200 flex items-center justify-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ) : designs.length === 0 ? (
            <Card className="p-6 border bg-white backdrop-blur-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:border-purple-200 flex flex-col items-center justify-center space-y-4">
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
            <Card className="p-6 border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Your Designs
                </span>
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-100/80 shadow-sm">
                <Table className="min-w-full text-sm bg-white/60 backdrop-blur-sm">
                  <TableHeader className="bg-gray-50/80">
                    <TableRow>
                      <TableHead className="p-3 font-medium text-gray-700">Image</TableHead>
                      <TableHead className="p-3 font-medium text-gray-700">Customizations</TableHead>
                      <TableHead className="p-3 w-32 font-medium text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designs.map((design) => (
                      <TableRow key={design.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="p-2">
                          <button 
                            onClick={() => setPreviewImage(design.public_url)}
                            className="hover:opacity-80 transition-opacity"
                            aria-label="Preview design"
                          >
                            <img 
                              src={design.public_url} 
                              alt="Design" 
                              className="w-12 h-12 object-cover rounded border shadow-sm"
                            />
                          </button>
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="space-y-1 text-sm">
                            {design.text1 && (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-700">{design.text1}</span>
                                  <div className="w-3 h-3 rounded-full border shadow-sm" style={{ backgroundColor: design.color1 }} />
                                </div>
                                <div className="text-xs text-gray-500">
                                  <span>{design.font1}</span> · <span>{design.size1}</span>
                                </div>
                              </div>
                            )}
                            {design.text2 && (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-700">{design.text2}</span>
                                  <div className="w-3 h-3 rounded-full border shadow-sm" style={{ backgroundColor: design.color2 }} />
                                </div>
                                <div className="text-xs text-gray-500">
                                  <span>{design.font2}</span> · <span>{design.size2}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              disabled={!orderDetails || !designs.length}
                              onClick={async () => {
                                try {
                                  console.log('Starting order placement...');
                                  
                                  // Get authenticated user
                                  const { data: { user }, error: authError } = await supabase.auth.getUser();
                                  if (authError || !user) {
                                    console.error('Authentication error:', authError);
                                    throw new Error('User not authenticated');
                                  }
                                  console.log('Authenticated user:', user.id);

                                  // Validate selected design
                                  if (!designs.length) {
                                    console.error('No designs available');
                                    throw new Error('No designs available');
                                  }
                                  const design = designs[0];
                                  console.log('Selected design:', design.id);

                                  // Validate WooCommerce order
                                  if (!orderDetails) {
                                    console.error('No order details available');
                                    throw new Error('No order details available');
                                  }
                                  console.log('Order details:', orderDetails.id);

                                  // Validate order status (completed, processing, and delivered are valid paid statuses)
                                  const validStatuses = ['completed', 'processing', 'delivered'];
                                  if (!validStatuses.includes(orderDetails.status)) {
                                    console.error('Invalid order status:', orderDetails.status);
                                    throw new Error(`Only paid orders can be processed. Current status: ${orderDetails.status}`);
                                  }
                                  console.log('Order status valid:', orderDetails.status);

                                  // Get first line item (assuming single product orders)
                                  const lineItem = orderDetails.line_items[0];
                                  if (!lineItem) {
                                    console.error('No line items found in order');
                                    throw new Error('No line items found in order');
                                  }
                                  console.log('Line item:', lineItem.id);

                                  // Create order data with separate line item columns
                                  const orderData = {
                                    user_id: user.id,
                                    design_id: design.id,
                                    public_url: design.public_url,
                                    text1: design.text1 || '',
                                    text2: design.text2 || null,
                                    font1: design.font1 || '',
                                    font2: design.font2 || null,
                                    color1: design.color1 || '',
                                    color2: design.color2 || null,
                                    size1: design.size1 || 0,
                                    size2: design.size2 || null,
                                    // WooCommerce order fields
                                    woocommerce_id: orderDetails.id,
                                    woocommerce_parent_id: orderDetails.parent_id,
                                    woocommerce_number: orderDetails.number,
                                    woocommerce_status: orderDetails.status,
                                    woocommerce_date_created: orderDetails.date_created,
                                    woocommerce_total: orderDetails.total,
                                    // Billing info
                                    billing_first_name: orderDetails.billing.first_name,
                                    billing_last_name: orderDetails.billing.last_name,
                                    billing_email: orderDetails.billing.email,
                                    billing_phone: orderDetails.billing.phone,
                                    // Line item fields
                                    line_item_id: lineItem.id,
                                    line_item_name: lineItem.name,
                                    line_item_product_id: lineItem.product_id,
                                    line_item_variation_id: lineItem.variation_id,
                                    line_item_quantity: lineItem.quantity,
                                    line_item_price: lineItem.price,
                                    line_item_subtotal: lineItem.subtotal,
                                    line_item_total: lineItem.total,
                                    line_item_sku: lineItem.sku,
                                    line_item_meta_data: lineItem.meta_data,
                                    status: 'pending'
                                  };

                                  console.log('Order data to insert:', JSON.stringify(orderData, null, 2));
                                  
                                  // Insert order
                                  console.log('Attempting to insert order...');
                                  const { data, error } = await supabase
                                    .from('orders')
                                    .insert(orderData)
                                    .select();

                                  console.log('Insert result:', { data, error });

                                  if (error) {
                                    console.error('Order insertion failed:', error);
                                    throw error;
                                  }

                                  if (!data) {
                                    console.error('No data returned from order insertion');
                                    throw new Error('No data returned from order insertion');
                                  }

                                  console.log('Order successfully created:', data);
                                  // Redirect to confirmation
                                  console.log('Redirecting to confirmation page...');
                                  window.location.href = '/order/confirmation';
                                } catch (error) {
                                  toast({
                                    title: 'Order Failed',
                                    description: error instanceof Error ? error.message : 'Failed to place order',
                                    variant: 'destructive'
                                  });
                                }
                              }}
                            >
                              Place Order
                            </Button>
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
                          </div>
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

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Image Preview</DialogTitle>
          </VisuallyHidden>
          <div className="relative">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute right-2 top-2 p-2 rounded-full bg-white/90 hover:bg-gray-100 transition-colors z-10"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage || ''}
              alt="Design preview"
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
