"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { YourDesignsSection, type Design } from "@/components/order/YourDesignsSection";
import { FindYourOrderSection } from "@/components/order/FindYourOrderSection";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "../../components/ui/visually-hidden";
import { WooCommerceOrder } from "@/types/woocommerce";

import { useToast } from "@/hooks/use-toast";

export default function OrderPage() {
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<WooCommerceOrder | null>(null);
  const [showDesigns, setShowDesigns] = useState(false);

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 p-4 md:pl-[78px] min-h-screen backdrop-blur-sm">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="py-4 md:py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Customization Order
          </h1>
          <p className="mt-2 text-center text-gray-600/90 text-sm md:text-base max-w-2xl mx-auto">
            To place your order: 
            1. Find your order ID from your bohurupi.com purchase confirmation email
            2. Enter it below to fetch your order details
            3. Select a design and complete the order
          </p>
          <motion.div
            className="flex justify-center mt-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
        </motion.div>

        <div className="mt-4">
          {/* Order Details Section */}
          <FindYourOrderSection 
            onOrderFetched={(order) => {
              setOrderDetails(order);
              setShowDesigns(true);
            }}
          />

          {/* Your Designs Dialog */}
          <Dialog open={showDesigns} onOpenChange={setShowDesigns}>
            <DialogContent className="max-w-3xl">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Your Designs
                </span>
              </DialogTitle>
              <YourDesignsSection 
                orderDetails={orderDetails}
                onPlaceOrder={async (design) => {
                  try {
                    console.log('Starting order placement...');
                    
                    // Get authenticated user
                    const { data: { user }, error: authError } = await supabase.auth.getUser();
                    if (authError || !user) {
                      console.error('Authentication error:', authError);
                      throw new Error('User not authenticated');
                    }
                    console.log('Authenticated user:', user.id);

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
                onPreviewImage={(url) => setPreviewImage(url)}
              />
            </DialogContent>
          </Dialog>
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
