'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import { SalesOrder, Organization, Customer, SalesOrderItem, Product, Warehouse } from '@prisma/client';

type InvoiceData = SalesOrder & {
    organization: Organization;
    customer: Customer;
    warehouse: Warehouse;
    items: (SalesOrderItem & {
        product: Product;
    })[];
};

interface InvoiceContentProps {
    order: InvoiceData;
}

export function InvoiceContent({ order }: InvoiceContentProps) {
    return (
        <div className="min-h-screen bg-white p-8">
            {/* Print Button */}
            <div className="no-print mb-6 flex justify-end">
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Print Invoice
                </button>
            </div>

            {/* Invoice */}
            <div className="max-w-4xl mx-auto border border-slate-300 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">INVOICE</h1>
                        <p className="text-slate-600">#{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-slate-900">{order.organization.name}</h2>
                        <p className="text-sm text-slate-600 mt-1">{order.organization.address}</p>
                        <p className="text-sm text-slate-600">{order.organization.phone}</p>
                        <p className="text-sm text-slate-600">{order.organization.email}</p>
                    </div>
                </div>

                {/* Customer & Date Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">BILL TO:</h3>
                        <p className="font-medium text-slate-900">{order.customer.name}</p>
                        <p className="text-sm text-slate-600">{order.customer.address}</p>
                        <p className="text-sm text-slate-600">{order.customer.city}</p>
                        <p className="text-sm text-slate-600">{order.customer.phone}</p>
                        <p className="text-sm text-slate-600">{order.customer.email}</p>
                    </div>
                    <div className="text-right">
                        <div className="mb-2">
                            <span className="text-sm font-semibold text-slate-700">Invoice Date:</span>
                            <p className="text-slate-900">{formatDate(order.orderDate)}</p>
                        </div>
                        <div className="mb-2">
                            <span className="text-sm font-semibold text-slate-700">Status:</span>
                            <p className="text-slate-900">{order.status}</p>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-slate-700">Warehouse:</span>
                            <p className="text-slate-900">{order.warehouse.name}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-slate-300">
                            <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">ITEM</th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700">QTY</th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700">UNIT PRICE</th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700">DISCOUNT</th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => (
                            <tr key={item.id} className="border-b border-slate-200">
                                <td className="py-3 px-2">
                                    <p className="font-medium text-slate-900">{item.product.name}</p>
                                    <p className="text-sm text-slate-600">{item.product.sku}</p>
                                </td>
                                <td className="text-right py-3 px-2 text-slate-900">{item.quantity}</td>
                                <td className="text-right py-3 px-2 text-slate-900">
                                    {formatCurrency(Number(item.unitPrice))}
                                </td>
                                <td className="text-right py-3 px-2 text-slate-900">
                                    {formatCurrency(Number(item.discount))}
                                </td>
                                <td className="text-right py-3 px-2 font-medium text-slate-900">
                                    {formatCurrency(Number(item.lineTotal))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-64">
                        <div className="flex justify-between py-2">
                            <span className="text-slate-700">Subtotal:</span>
                            <span className="font-medium text-slate-900">
                                {formatCurrency(Number(order.subtotal))}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-slate-700">Tax:</span>
                            <span className="font-medium text-slate-900">
                                {formatCurrency(Number(order.tax))}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-slate-700">Discount:</span>
                            <span className="font-medium text-slate-900">
                                {formatCurrency(Number(order.discount))}
                            </span>
                        </div>
                        <div className="flex justify-between py-3 border-t-2 border-slate-300">
                            <span className="text-lg font-bold text-slate-900">Total:</span>
                            <span className="text-lg font-bold text-slate-900">
                                {formatCurrency(Number(order.total))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">NOTES:</h3>
                        <p className="text-sm text-slate-600">{order.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-slate-300 pt-6 text-center">
                    <p className="text-sm text-slate-600">
                        Thank you for your business!
                    </p>
                </div>
            </div>

            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
        </div>
    );
}
