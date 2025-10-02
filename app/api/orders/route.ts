import { NextRequest, NextResponse } from "next/server"
import { orderStorageService } from "@/lib/order-storage"

export async function GET(request: NextRequest) {
  try {
    const orders = orderStorageService.getAllOrders()
    
    console.log("[v0] Orders API - Retrieved", orders.length, "orders")
    
    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        ...order,
        // Mascarar dados sensíveis
        customerData: {
          ...order.customerData,
          document: order.customerData.document ? 
            order.customerData.document.substring(0, 3) + "***" + order.customerData.document.substring(-2) : 
            ""
        }
      }))
    })
  } catch (error) {
    console.error("[v0] Orders API - Error:", error)
    
    return NextResponse.json({
      success: false,
      error: "Error retrieving orders",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Endpoint para limpar pedidos (apenas para desenvolvimento)
export async function DELETE(request: NextRequest) {
  try {
    orderStorageService.clear()
    
    return NextResponse.json({
      success: true,
      message: "All orders cleared"
    })
  } catch (error) {
    console.error("[v0] Orders API - Error clearing:", error)
    
    return NextResponse.json({
      success: false,
      error: "Error clearing orders"
    }, { status: 500 })
  }
}
