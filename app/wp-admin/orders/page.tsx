'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { OrderDetailsDialog } from './OrderDetailsDialog';

interface Order {
  id: number;
  woocommerce_number: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  woocommerce_total: number;
  woocommerce_status: string;
  created_at: string;
  updated_at: string;
}

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

export default function OrdersPage() {
  const supabase = createClientComponentClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 10;

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ woocommerce_status: newStatus })
        .eq('id', orderId)
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, ...data[0] } 
            : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDelete = async (orderId: number) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        toast({
          title: "Error deleting order",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted",
        variant: "default",
      });

    } catch (error: any) {
      console.error('Error deleting order:', error);
      if (error?.message !== error?.code) {
        toast({
          title: "Error deleting order",
          description: error?.message || "An unknown error occurred",
          variant: "destructive",
        });
      }
    }
  };

  const handleRowClick = async (orderId: number) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*`)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setSelectedOrder(data);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`*`)
          .order('created_at', { ascending: false })
          .range(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage - 1
          );

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100dvh-4rem)] relative z-10 px-2 sm:px-4 lg:px-8">
        <motion.div
          className="py-6 md:py-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Orders Management
              </h1>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/wp-admin/wp-dashboard">
                <ChevronLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </motion.div>

        {selectedOrder && (
          <OrderDetailsDialog
            order={selectedOrder}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )}

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
            <Table className="[&_th]:bg-white/50 [&_th]:backdrop-blur-md">
              <TableHeader className="hidden sm:table-header-group">
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="hover:bg-gray-50 transition-colors flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 sm:table-row sm:py-0"
                  >
                    <TableCell className="font-medium text-sm sm:text-base">
                      {order.woocommerce_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRowClick(order.id)}
                          className="h-8 text-sm px-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all"
                        >
                          View
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-sm px-3 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the order.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(order.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm sm:text-base">
                      <div className="flex items-center gap-1">
                        {`${order.billing_first_name} ${order.billing_last_name}`}
                        <span className={`px-1 py-[1px] rounded-full text-[11px] sm:text-sm ${
                          order.woocommerce_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.woocommerce_status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.woocommerce_status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{order.billing_email}</TableCell>
                    <TableCell className="hidden sm:table-cell">${order.woocommerce_total}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await handleStatusUpdate(order.id, 'completed');
                              toast({
                                title: 'Success',
                                description: 'Order status updated to completed',
                                variant: 'default',
                              });
                            } catch (error) {
                              toast({
                                title: 'Error',
                                description: 'Failed to update order status',
                                variant: 'destructive',
                              });
                            }
                          }}
                          disabled={order.woocommerce_status === 'completed'}
                          className="h-8 text-sm px-3"
                        >
                          Complete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center p-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">Page {currentPage}</span>
              <Button
                variant="ghost"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={orders.length < itemsPerPage}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
