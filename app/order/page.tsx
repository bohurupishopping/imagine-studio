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
    <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 p-4 md:pl-[78px] min-h-screen">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-4 rounded-full border border-purple-100 shadow-lg mb-8"
          role="heading"
          aria-level={1}
        >
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
          <Card className="p-6 border bg-white backdrop-blur-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:border-purple-200">
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
                  {/* Billing Address - Compact Mobile Version */}
                  <Card className="p-2 md:p-4 border bg-white backdrop-blur-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:border-purple-200">
                    <h4 className="font-semibold mb-1 text-xs md:text-sm text-purple-600">Billing</h4>
                    <div className="text-xs md:text-sm text-gray-700 space-y-1">
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
            <Card className="p-6 border bg-white backdrop-blur-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:border-purple-200">
              <h2 className="text-sm font-semibold mb-4 text-purple-600">Your Designs</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
                <Table className="min-w-full text-sm">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="p-2 font-medium text-gray-600">Image</TableHead>
                      <TableHead className="p-2 font-medium text-gray-600">Customizations</TableHead>
                      <TableHead className="p-2 w-32 font-medium text-gray-600">Actions</TableHead>
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
