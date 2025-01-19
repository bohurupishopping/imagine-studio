"use client";

import { motion } from "framer-motion";
import { CheckCircle, Truck, Package, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function OrderConfirmationPage() {
  const { toast } = useToast();
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 p-4 md:pl-[78px] min-h-screen backdrop-blur-sm">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Section */}
        <motion.div
          className="py-4 md:py-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-green-600 to-blue-600 bg-clip-text text-transparent">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-gray-600/90 text-sm md:text-base max-w-2xl mx-auto">
            Your order has been successfully placed. Here's what happens next:
          </p>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-row items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 md:w-8 md:h-8 bg-green-50 rounded-full flex items-center justify-center">
                <Package className="w-2.5 h-2.5 md:w-4 md:h-4 text-green-600" />
              </div>
              <span className="text-xs md:text-base font-medium">Processed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 md:w-8 md:h-8 bg-purple-50 rounded-full flex items-center justify-center">
                <Truck className="w-2.5 h-2.5 md:w-4 md:h-4 text-purple-600" />
              </div>
              <span className="text-xs md:text-base font-medium">Shipped</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 md:w-8 md:h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-600" />
              </div>
              <span className="text-xs md:text-base font-medium">Delivered</span>
            </div>
          </div>
          <Progress value={33} className="h-1 md:h-2" />
        </motion.div>

        {/* Delivery Information */}
        <motion.div
          className="mt-6 grid gap-4 md:gap-6 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold">Estimated Delivery</h2>
                <p className="text-sm md:text-base text-gray-600">
                  {deliveryDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold">Shipping Details</h2>
                <p className="text-sm md:text-base text-gray-600">
                  Your order will be shipped via standard delivery within 4-5 business days
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
