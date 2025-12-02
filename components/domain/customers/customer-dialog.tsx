'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createCustomer, updateCustomer } from '@/features/customers/actions';
import { Customer } from '@prisma/client';
import { DialogForm } from '@/components/shared/dialog-form';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
});

interface CustomerDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: (customer: any) => void;
    customer?: Customer;
}

export function CustomerDialog({ trigger, open, onOpenChange, onSuccess, customer }: CustomerDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined;
    const show = isControlled ? open : internalOpen;
    const setShow = isControlled ? onOpenChange! : setInternalOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
        },
    });

    useEffect(() => {
        if (customer) {
            form.reset({
                name: customer.name,
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || '',
                city: customer.city || '',
            });
        } else {
            form.reset({
                name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
            });
        }
    }, [customer, form, show]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            let result;
            if (customer) {
                result = await updateCustomer(customer.id, values);
            } else {
                result = await createCustomer(values);
            }
            form.reset();
            setShow(false);
            if (onSuccess) {
                onSuccess(result);
            }
        } catch (error) {
            console.error('Failed to save customer:', error);
        }
    };

    return (
        <DialogForm
            trigger={trigger}
            open={show}
            onOpenChange={setShow}
            title={customer ? 'Edit Customer' : 'Add New Customer'}
            description={customer ? 'Update customer details.' : 'Create a new customer profile.'}
            form={form}
            onSubmit={onSubmit}
            submitLabel={customer ? 'Update Customer' : 'Save Customer'}
        >
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Customer Name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input placeholder="Phone" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                            <Input placeholder="Address" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                            <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </DialogForm>
    );
}
