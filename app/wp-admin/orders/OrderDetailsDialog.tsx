'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Package, CreditCard, User, Palette, Type, Calendar, CreditCard as Payment } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface OrderDetails {
  id: number;
  user_id: string;
  design_id: number;
  public_url: string;
  text1: string;
  text2?: string;
  font1: string;
  font2?: string;
  color1: string;
  color2?: string;
  size1: number;
  size2?: number;
  woocommerce_id: number;
  woocommerce_parent_id?: number;
  woocommerce_number: string;
  woocommerce_status: string;
  woocommerce_date_created: string;
  woocommerce_total: number;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  line_item_id: number;
  line_item_name: string;
  line_item_product_id: number;
  line_item_variation_id?: number;
  line_item_quantity: number;
  line_item_price: number;
  line_item_subtotal: number;
  line_item_total: number;
  line_item_sku?: string;
  line_item_meta_data?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OrderDetailsDialogProps {
  order: OrderDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Status Badge Component
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'failed';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string): string => {
    const styles: Record<OrderStatus, string> = {
      pending: 'bg-yellow-500 hover:bg-yellow-600',
      processing: 'bg-blue-500 hover:bg-blue-600',
      completed: 'bg-green-500 hover:bg-green-600',
      cancelled: 'bg-red-500 hover:bg-red-600',
      refunded: 'bg-purple-500 hover:bg-purple-600',
      failed: 'bg-gray-500 hover:bg-gray-600',
    };
    
    const normalizedStatus = status.toLowerCase() as OrderStatus;
    return styles[normalizedStatus] || 'bg-gray-500 hover:bg-gray-600';
  };

  return (
    <Badge 
      className={`${getStatusStyle(status)} text-white font-medium transition-colors`}
      aria-label={`Order status: ${status}`}
    >
      {status}
    </Badge>
  );
};

// Design Preview Component
const DesignPreview = ({ url }: { url: string }) => (
  <div className="flex flex-col items-center gap-2 sm:gap-3">
    <div className="w-[96px] h-[96px] sm:w-[128px] sm:h-[128px] rounded-lg overflow-hidden shadow-lg border border-gray-200/50 bg-white relative group">
      <AspectRatio ratio={1}>
        <img
          src={url}
          alt="Design Preview"
          className="w-full h-full object-contain"
        />
      </AspectRatio>
    </div>
    <Button
      variant="outline"
      size="sm"
      asChild
      className="w-full max-w-[96px] sm:max-w-[128px] text-xs sm:text-sm"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open design in new tab"
      >
        <Package className="w-4 h-4 mr-2" />
        View Design
      </a>
    </Button>
  </div>
);

// Info Row Component
const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | number; icon?: any }) => (
  <div className="flex items-center justify-between gap-2 group">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-purple-600 opacity-75 group-hover:opacity-100 transition-opacity" />}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </div>
    <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
  </div>
);

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-xl lg:max-w-2xl bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 backdrop-blur-sm">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Order #{order.woocommerce_number}
            </DialogTitle>
            <StatusBadge status={order.woocommerce_status} />
          </motion.div>
        </DialogHeader>

        <ScrollArea className="h-[80vh] pr-4">
          {/* Design Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-purple-100 bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition-all">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 rounded-md">
                    <Palette className="w-4 h-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-purple-600">Design Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-3">
                    <InfoRow label="Text 1" value={order.text1} icon={Type} />
                    {order.text2 && <InfoRow label="Text 2" value={order.text2} icon={Type} />}
                    <InfoRow label="Font 1" value={order.font1} icon={Type} />
                    {order.font2 && <InfoRow label="Font 2" value={order.font2} icon={Type} />}
                    
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Colors</span>
                      <div className="flex gap-2">
                        <span 
                          className="inline-block w-4 h-4 rounded-full border shadow-sm"
                          style={{ backgroundColor: order.color1 }}
                          aria-label={`Color 1: ${order.color1}`}
                        />
                        {order.color2 && (
                          <span 
                            className="inline-block w-4 h-4 rounded-full border shadow-sm"
                            style={{ backgroundColor: order.color2 }}
                            aria-label={`Color 2: ${order.color2}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <DesignPreview url={order.public_url} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="my-4" />

          {/* Order Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-blue-100 bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition-all">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-md">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-blue-600">Order Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <InfoRow label="Created" value={format(new Date(order.created_at), 'PPpp')} icon={Calendar} />
                    <InfoRow label="Updated" value={format(new Date(order.updated_at), 'PPpp')} icon={Calendar} />
                    <InfoRow label="Total" value={`$${order.woocommerce_total.toFixed(2)}`} icon={Payment} />
                  </div>
                  <div className="space-y-3">
                    <InfoRow label="Product" value={order.line_item_name} icon={Package} />
                    <InfoRow label="Quantity" value={order.line_item_quantity} icon={Package} />
                    <InfoRow label="Price" value={`$${order.line_item_price.toFixed(2)}`} icon={CreditCard} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="my-4" />

          {/* Billing Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-green-100 bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition-all">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-50 rounded-md">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-green-600">Customer Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <InfoRow 
                      label="Name" 
                      value={`${order.billing_first_name} ${order.billing_last_name}`} 
                      icon={User} 
                    />
                    <InfoRow label="Email" value={order.billing_email} icon={User} />
                  </div>
                  <div className="space-y-3">
                    <InfoRow label="Phone" value={order.billing_phone} icon={User} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
