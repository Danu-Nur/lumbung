"use client";

import { useFieldArray, Control, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
}

interface LineItemsFormProps {
    control: Control<any>;
    name: string;
    products: Product[];
    priceFieldName?: "unitPrice" | "unitCost";
    showDiscount?: boolean;
    hidePrice?: boolean;
}

export function LineItemsForm({
    control,
    name,
    products,
    priceFieldName = "unitPrice",
    showDiscount = false,
    hidePrice = false,
}: LineItemsFormProps) {
    const t = useTranslations("common");
    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    const { watch } = useFormContext();
    const items = watch(name) || [];

    const handleAddItem = (productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            const newItem: any = {
                productId: product.id,
                productName: product.name,
                quantity: 1,
            };
            if (!hidePrice) {
                newItem[priceFieldName] = Number(product.price);
            }
            if (showDiscount) newItem.discount = 0;

            append(newItem);
        }
    };

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * (item[priceFieldName] || 0)), 0);
    const totalDiscount = showDiscount ? items.reduce((sum: number, item: any) => sum + (item.discount || 0), 0) : 0;
    const total = subtotal - totalDiscount;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("table.items") || "Items"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <select
                        className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        onChange={(e) => {
                            if (e.target.value) {
                                handleAddItem(e.target.value);
                                e.target.value = "";
                            }
                        }}
                    >
                        <option value="">{t("buttons.add") || "Select Product"}</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                                {!hidePrice && ` - ${formatCurrency(Number(product.price))}`}
                            </option>
                        ))}
                    </select>
                </div>

                {fields.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                        {t("table.noData") || "No items added"}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-center p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{(field as any).productName}</p>
                                </div>
                                <FormField
                                    control={control}
                                    name={`${name}.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="w-20 h-8"
                                                    min="1"
                                                    placeholder="Qty"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                {!hidePrice && (
                                    <FormField
                                        control={control}
                                        name={`${name}.${index}.${priceFieldName}`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-28 h-8"
                                                        step="0.01"
                                                        placeholder="Price"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {showDiscount && (
                                    <FormField
                                        control={control}
                                        name={`${name}.${index}.discount`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24 h-8"
                                                        step="0.01"
                                                        placeholder="Disc"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {!hidePrice && (
                    <div className="border-t pt-4 space-y-2">
                        {showDiscount && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Discount:</span>
                                    <span className="font-medium">{formatCurrency(totalDiscount)}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between text-lg font-bold">
                            <span>{t("table.total") || "Total"}:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
