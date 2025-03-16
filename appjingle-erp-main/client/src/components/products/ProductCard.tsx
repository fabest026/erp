import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Package, Edit, Trash2 } from "lucide-react";
import { Product, ProductCategory } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  category?: ProductCategory;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onClick?: (product: Product) => void;
  actionType?: "add" | "edit" | "none";
}

export default function ProductCard({
  product,
  category,
  onEdit,
  onDelete,
  onClick,
  actionType = "edit"
}: ProductCardProps) {
  const handleClick = () => {
    if (onClick) onClick(product);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(product);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary hover:shadow-md"
      )}
      onClick={onClick ? handleClick : undefined}
    >
      <CardHeader className="p-0">
        <div className="h-40 bg-gray-100 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-16 w-16 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-base">{product.name}</h3>
          <Badge variant="outline" className="text-xs">
            {product.unit}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.description || "No description available"}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-primary">
              {formatCurrency(product.price)}
            </div>
            {product.costPrice && (
              <div className="text-xs text-gray-500">
                Cost: {formatCurrency(product.costPrice)}
              </div>
            )}
          </div>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category.name}
            </Badge>
          )}
        </div>
      </CardContent>
      {actionType !== "none" && (
        <CardFooter className="p-3 pt-0 flex gap-2">
          {actionType === "add" ? (
            <Button
              className="w-full bg-primary hover:bg-primary-dark"
              onClick={handleClick}
            >
              Add to Cart
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
