'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Package, CreditCard, User, Palette, Type } from 'lucide-react';

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

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 backdrop-blur-sm">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Order Details - #{order.woocommerce_number}
            </DialogTitle>
          </motion.div>
        </DialogHeader>

        <ScrollArea className="h-[80vh] pr-4">
          {/* Design Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
              <CardHeader className="p-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-md">
                    <Palette className="w-4 h-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-purple-600">
                    Design Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-purple-600" />
                      <div>
                        <p className="text-xs font-medium">Text 1</p>
                        <p className="text-xs text-gray-600">{order.text1}</p>
                      </div>
                    </div>
                    {order.text2 && (
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Text 2</p>
                          <p className="text-sm text-gray-600">{order.text2}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Font 1</p>
                        <p className="text-sm text-gray-600">{order.font1}</p>
                      </div>
                    </div>
                    {order.font2 && (
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Font 2</p>
                          <p className="text-sm text-gray-600">{order.font2}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Colors</p>
                        <div className="flex gap-2">
                          <span 
                            className="inline-block w-4 h-4 rounded-full border"
                            style={{ backgroundColor: order.color1 }}
                          />
                          {order.color2 && (
                            <span 
                              className="inline-block w-4 h-4 rounded-full border"
                              style={{ backgroundColor: order.color2 }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Preview</p>
                      </div>
                    </div>
                    <div className="w-full max-w-[200px] h-[200px] bg-gray-100 rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                      <iframe
                        src={order.public_url}
                        className="w-full h-full border-0 object-contain"
                        title="Design Preview"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="my-6" />

          {/* Order Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
              <CardHeader className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-md">
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-purple-600">
                    Order Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant={order.woocommerce_status === 'completed' ? 'default' : 'secondary'}>
                        {order.woocommerce_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-sm text-gray-600">${order.woocommerce_total.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-gray-600">{format(new Date(order.created_at), 'PPpp')}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Updated</p>
                      <p className="text-sm text-gray-600">{format(new Date(order.updated_at), 'PPpp')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Product</p>
                      <p className="text-sm text-gray-600">{order.line_item_name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Quantity</p>
                      <p className="text-sm text-gray-600">{order.line_item_quantity}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-sm text-gray-600">${order.line_item_price.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Subtotal</p>
                      <p className="text-sm text-gray-600">${order.line_item_subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="my-6" />

          {/* Billing Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
              <CardHeader className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-md">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-purple-600">
                    Billing Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-gray-600">{order.billing_first_name} {order.billing_last_name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{order.billing_email}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{order.billing_phone}</p>
                    </div>
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
