"use client";

import { useState } from "react";
import { CategoryDialog } from "@/components/domain/categories/category-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Category {
    id: string;
    name: string;
}

interface CategorySelectorProps {
    initialCategories: Category[];
}

export function CategorySelector({ initialCategories }: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    const handleCategoryCreated = (newCategory: Category) => {
        setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedCategoryId(newCategory.id);
    };

    return (
        <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex gap-2">
                <div className="flex-1">
                    <Select
                        name="categoryId"
                        value={selectedCategoryId}
                        onValueChange={setSelectedCategoryId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <CategoryDialog
                    trigger={
                        <Button type="button" variant="outline" size="icon" title="Add New Category">
                            <Plus className="h-4 w-4" />
                        </Button>
                    }
                    onSuccess={handleCategoryCreated}
                />
            </div>
            {/* Hidden input to ensure value is submitted with the form if Select doesn't work directly with server actions in some setups, 
          but shadcn Select usually needs a hidden input or controlled state if not using standard select. 
          Since we are inside a form action, we need to make sure 'categoryId' is sent. 
          The Select component from shadcn/radix-ui acts as a controlled input but doesn't always emit a native 'name' attribute for FormData.
          Safest bet is a hidden input.
      */}
            <input type="hidden" name="categoryId" value={selectedCategoryId} />
        </div>
    );
}
