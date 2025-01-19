"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { WooCommerceOrder } from "@/types/woocommerce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface FindYourOrderSectionProps {
  onOrderFetched: (order: WooCommerceOrder) => void;
}

export function FindYourOrderSection({ onOrderFetched }: FindYourOrderSectionProps) {
  const [orderId, setOrderId] = useState("");
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
      onOrderFetched(order);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Failed to fetch order");
    }
  };

  return (
    <Card className="p-6 border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Find Your Order
            </h2>
          </div>
          <p className="text-xs text-gray-500 pl-7">Enter your order ID to fetch details and final your order</p>
        </div>
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
            Find Order
          </Button>
        </div>
        {!orderDetails && (
          <motion.div
            className="mt-3 text-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: orderDetails ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="link"
              className="text-purple-600 hover:text-purple-700 text-sm"
              onClick={() => window.open('https://bohurupi.com/bengali-customized-t-shirts/', '_blank')}
            >
              Don't have an order ID? Get one here
            </Button>
          </motion.div>
        )}
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
  );
}
