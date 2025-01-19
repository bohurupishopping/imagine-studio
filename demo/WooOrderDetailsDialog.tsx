import { WooCommerceOrder } from "@/app/types/woocommerce";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/app/global/ui/dialog";
import { Badge } from "@/app/global/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/app/global/ui/separator";
import { ScrollArea } from "@/app/global/ui/scroll-area";
import { Package2, MapPin, CreditCard, CalendarDays, Truck } from "lucide-react";
import { CashfreeOrderResponse } from '@/app/types/cashfree';
import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/app/global/ui/use-toast";

interface OrderDetailsDialogProps {
  order: WooCommerceOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MetaData {
  id: number;
  key: string;
  value: string;
  display_key: string;
  display_value: string;
}

interface Variant {
  label: string;
  value: string;
  type: 'regular' | 'full-sleeve' | 'children';
}

interface TrackingInfo {
  number?: string;
  provider?: string;
  url?: string;
}

// Memoized function to get status color
const getStatusColor = (status: string): { bg: string; text: string; border: string } => {
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    'pending': { 
      bg: 'bg-amber-500', 
      text: 'text-white font-medium',
      border: 'border-amber-600'
    },
    'processing': { 
      bg: 'bg-blue-500', 
      text: 'text-white font-medium',
      border: 'border-blue-600'
    },
    'on-hold': { 
      bg: 'bg-orange-500', 
      text: 'text-white font-medium',
      border: 'border-orange-600'
    },
    'completed': { 
      bg: 'bg-emerald-500', 
      text: 'text-white font-medium',
      border: 'border-emerald-600'
    },
    'cancelled': { 
      bg: 'bg-rose-500', 
      text: 'text-white font-medium',
      border: 'border-rose-600'
    },
    'refunded': { 
      bg: 'bg-purple-500', 
      text: 'text-white font-medium',
      border: 'border-purple-600'
    },
    'failed': { 
      bg: 'bg-red-500', 
      text: 'text-white font-medium',
      border: 'border-red-600'
    }
  };
  return statusColors[status] || { 
    bg: 'bg-gray-500', 
    text: 'text-white font-medium',
    border: 'border-gray-600'
  };
};

// Optimized function to get meta value
const getMetaValue = (meta_data: MetaData[], key: string): string | null => {
  for (let i = 0; i < meta_data.length; i++) {
    if (meta_data[i].key === key) {
      return meta_data[i].value;
    }
  }
  return null;
};

// Optimized function to get variant badges
const getVariantBadges = (meta_data: MetaData[]): Variant[] => {
  const variants = [
    { key: 'select_size', label: 'Size' },
    { key: 'select_colour', label: 'Color' },
    { key: 'select_colour_fs', label: 'Full Sleeve Color' },
    { key: 'size_fs', label: 'Full Sleeve Size' },
    { key: 'select_size_child', label: "Child's Size" },
    { key: 'select_colour_child', label: "Child's Color" },
  ];

  const result: Variant[] = [];
  for (let i = 0; i < variants.length; i++) {
    const value = getMetaValue(meta_data, variants[i].key);
    if (value) {
      result.push({
        label: variants[i].label,
        value: value,
        type: variants[i].key.includes('_fs') ? 'full-sleeve' : 
              variants[i].key.includes('_child') ? 'children' : 'regular'
      });
    }
  }
  return result;
};

// Optimized function to get tracking info
const getTrackingInfo = (order: WooCommerceOrder): TrackingInfo | null => {
  const trackingMeta = order.meta_data?.find(meta => 
    meta.key === '_wc_shipment_tracking_items' || 
    meta.key === 'wc_shipment_tracking_items' ||
    meta.key === '_tracking_number'
  );

  if (!trackingMeta) return null;

  try {
    if (typeof trackingMeta.value === 'string') {
      if (trackingMeta.value.startsWith('[')) {
        const trackingItems = JSON.parse(trackingMeta.value);
        if (trackingItems?.[0]) {
          return {
            number: trackingItems[0].tracking_number,
            provider: trackingItems[0].tracking_provider,
            url: trackingItems[0].tracking_link || trackingItems[0].tracking_url
          };
        }
      } else {
        return { number: trackingMeta.value };
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing tracking info:', error);
    return null;
  }
};

// Memoized Order Item Component
const OrderItem = ({ 
  item, 
  currency 
}: { 
  item: WooCommerceOrder['line_items'][0];
  currency: string;
}) => {
  const variants = useMemo(() => getVariantBadges(item.meta_data), [item.meta_data]);
  const itemTotal = useMemo(() => parseFloat(item.total).toFixed(2), [item.total]);
  const itemUnitPrice = useMemo(
    () => (parseFloat(item.total) / item.quantity).toFixed(2),
    [item.total, item.quantity]
  );

  return (
    <div className="p-2.5 sm:p-3 rounded-lg border border-gray-100/80 dark:border-gray-800/80 bg-gradient-to-br from-white/80 via-gray-50/50 to-white/80 dark:from-gray-800/80 dark:via-gray-900/50 dark:to-gray-800/80 shadow-sm">
      <div className="flex justify-between items-start gap-2 sm:gap-3">
        <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
          <p className="font-medium text-sm sm:text-base truncate">{item.name}</p>
          {variants.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {variants.map((variant, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className={`text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5 ${
                    variant.type === 'full-sleeve' 
                      ? 'bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-300' 
                      : variant.type === 'children'
                      ? 'bg-pink-500/10 border-pink-500/20 text-pink-700 dark:text-pink-300'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {variant.label}: {variant.value}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <span>Qty: {item.quantity}</span>
            {item.sku && <span className="truncate">SKU: {item.sku}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-sm sm:text-base">
            {currency} {itemTotal}
          </p>
          <p className="text-xs text-muted-foreground">
            {currency} {itemUnitPrice} each
          </p>
        </div>
      </div>
    </div>
  );
};

// Optimized WooOrderDetailsDialog Component
export function WooOrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const [cashfreeDetails, setCashfreeDetails] = useState<CashfreeOrderResponse | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const { toast } = useToast();

  const fetchCashfreeDetails = useCallback(async (orderNumber: string) => {
    setIsLoadingPayment(true);
    try {
      const response = await fetch(`/api/cashfree/orders/${orderNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      const data = await response.json();
      setCashfreeDetails(data);
    } catch (error) {
      console.error('Error fetching Cashfree details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayment(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open && order?.number) {
      fetchCashfreeDetails(order.number);
    }
  }, [open, order?.number, fetchCashfreeDetails]);

  const statusColor = useMemo(() => order ? getStatusColor(order.status) : null, [order?.status]);
  const trackingInfo = useMemo(() => order ? getTrackingInfo(order) : null, [order]);
  const orderSubtotal = useMemo(() => {
    if (!order) return '0.00';
    return (parseFloat(order.total) - parseFloat(order.shipping_total) - parseFloat(order.total_tax)).toFixed(2);
  }, [order]);
    
  // Optimized rendering of order items
  const renderOrderItems = useMemo(() => {
    return order
      ? order.line_items.map((item, index) => (
          <OrderItem
            key={`${item.id}-${index}`}
            item={item}
            currency={order.currency}
          />
        ))
      : [];
  }, [order]);

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg h-[85vh] sm:h-[80vh] flex flex-col p-0 rounded-3xl sm:rounded-3xl gap-0">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-sky-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/5" />
        
        <div className="sticky top-0 z-50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-100/80 dark:border-gray-700/80 px-2.5 sm:px-3 py-2.5 rounded-t-lg sm:rounded-t-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20">
                <Package2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Order #{order.number}
                </DialogTitle>
                <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(order.date_created), 'PPP p')}
                </div>
              </div>
            </div>
            <Badge className={`${statusColor?.bg} ${statusColor?.text} border ${statusColor?.border} text-[10px] sm:text-xs px-1.5 py-0.5`}>
              {order.status}
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 relative bg-white rounded-lg dark:bg-gray-800 rounded-lg backdrop-blur-sm">
          <div className="p-2.5 sm:p-3 space-y-2.5 sm:space-y-3">
            {/* Tracking Information */}
            {trackingInfo && (
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                    <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Tracking Information
                  </h3>
                </div>
                <div className="space-y-1 ml-7 sm:ml-9">
                  <p className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">Tracking Number:</span>{' '}
                    <span className="font-medium">{trackingInfo.number}</span>
                  </p>
                  {trackingInfo.provider && (
                    <p className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">Provider:</span>{' '}
                      <span className="font-medium">{trackingInfo.provider}</span>
                    </p>
                  )}
                  {trackingInfo.url && (
                    <a 
                      href={trackingInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline underline-offset-4"
                    >
                      Track Package
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Cashfree Payment Details */}
            {(isLoadingPayment || cashfreeDetails) && (
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Payment Details
                  </h3>
                </div>
                
                {isLoadingPayment ? (
                  <div className="flex items-center justify-center py-3 sm:py-4">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
                  </div>
                ) : cashfreeDetails ? (
                  <div className="space-y-2 ml-7 sm:ml-9">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Payment Status</p>
                        <span className={`inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm font-medium ${
                          cashfreeDetails.order_status === 'PAID'
                            ? 'bg-emerald-500 text-white'
                            : cashfreeDetails.order_status === 'PENDING'
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}>
                          {cashfreeDetails.order_status === 'PAID' ? 'Paid' : 
                           cashfreeDetails.order_status === 'PENDING' ? 'Pending' : 'Failed'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Cashfree Order ID</p>
                        <p className="text-xs sm:text-sm font-medium">{cashfreeDetails.cf_order_id}</p>
                      </div>
                      {cashfreeDetails.order_status === 'PAID' && (
                        <div className="col-span-2">
                          <p className="text-xs sm:text-sm text-muted-foreground">Payment Date</p>
                          <p className="text-xs sm:text-sm font-medium">
                            {format(new Date(cashfreeDetails.created_at), 'PPP p')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Customer Information */}
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100/80 dark:border-indigo-800/50 shadow-sm">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-md bg-indigo-500/10 dark:bg-indigo-400/10">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-medium text-indigo-900 dark:text-indigo-100">Billing Address</h3>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-sm font-medium">{order.billing.first_name} {order.billing.last_name}</p>
                  <p className="text-xs sm:text-sm">{order.billing.address_1}</p>
                  {order.billing.address_2 && <p className="text-xs sm:text-sm">{order.billing.address_2}</p>}
                  <p className="text-xs sm:text-sm">
                    {order.billing.city}, {order.billing.state} {order.billing.postcode}
                  </p>
                  <p className="text-xs sm:text-sm">{order.billing.country}</p>
                  <p className="text-xs sm:text-sm text-violet-600 dark:text-violet-400">{order.billing.email}</p>
                  <p className="text-xs sm:text-sm text-violet-600 dark:text-violet-400">{order.billing.phone}</p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100/80 dark:border-purple-800/50 shadow-sm">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-md bg-purple-500/10 dark:bg-purple-400/10">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-medium text-purple-900 dark:text-purple-100">Shipping Address</h3>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-sm font-medium">{order.shipping.first_name} {order.shipping.last_name}</p>
                  <p className="text-xs sm:text-sm">{order.shipping.address_1}</p>
                  {order.shipping.address_2 && <p className="text-xs sm:text-sm">{order.shipping.address_2}</p>}
                  <p className="text-xs sm:text-sm">
                    {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
                  </p>
                  <p className="text-xs sm:text-sm">{order.shipping.country}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                  <Package2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Order Items
                </h3>
              </div>
              <div className="space-y-2">
                {renderOrderItems}
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-gray-100/80 dark:border-gray-800/80 overflow-hidden bg-white/80 dark:bg-gray-900/80 shadow-sm">
              <h3 className="text-sm sm:text-base font-medium p-3 sm:p-4 bg-gray-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100">
                Order Summary
              </h3>
              <div className="p-3 sm:p-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Subtotal</span>
                  <span>{order.currency} {orderSubtotal}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Shipping</span>
                  <span>{order.currency} {parseFloat(order.shipping_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Tax</span>
                  <span>{order.currency} {parseFloat(order.total_tax).toFixed(2)}</span>
                </div>
                {parseFloat(order.discount_total) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{order.currency} {parseFloat(order.discount_total).toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span>Total</span>
                  <span>{order.currency} {parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="rounded-lg border border-gray-100/80 dark:border-gray-800/80 overflow-hidden bg-white/80 dark:bg-gray-900/80 shadow-sm">
              <div className="flex items-center gap-2 p-3 sm:p-4 bg-gray-50/80 dark:bg-gray-800/80">
                <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">Payment Method</h3>
              </div>
              <div className="p-3 sm:p-4 space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm">Payment Method: {order.payment_method_title}</p>
                {order.transaction_id && (
                  <p className="text-xs sm:text-sm">Transaction ID: {order.transaction_id}</p>
                )}
              </div>
            </div>

            {/* Customer Note */}
            {order.customer_note && (
              <div className="rounded-lg border border-gray-100/80 dark:border-gray-800/80 overflow-hidden bg-white/80 dark:bg-gray-900/80 shadow-sm">
                <h3 className="text-sm sm:text-base font-medium p-3 sm:p-4 bg-gray-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100">
                  Customer Note
                </h3>
                <p className="p-3 sm:p-4 text-xs sm:text-sm">{order.customer_note}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}