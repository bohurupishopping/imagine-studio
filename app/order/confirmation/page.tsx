"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmationPage() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 p-4 md:pl-[78px] min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="p-6 bg-white rounded-lg shadow-lg border border-purple-100">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Your order has been successfully processed. You will receive a confirmation email shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              View Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/imagine")}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Create New Design
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
