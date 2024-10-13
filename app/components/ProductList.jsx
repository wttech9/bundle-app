// app/components/ProductList.jsx
import React from "react";
import { ResourceList } from "@shopify/polaris";
import ProductItem from "./ProductItem";

const ProductList = ({ products, selectedProducts, onProductSelect }) => {
  return (
    <div style={{ height: "300px", overflowY: "scroll", marginTop: "10px" }}>
      <ResourceList
        resourceName={{ singular: "product", plural: "products" }}
        items={products}
        renderItem={(product) => (
          <ProductItem
            key={product.id}
            id={product.id}
            title={product.title}
            imageSrc={product.imageSrc}
            isChecked={selectedProducts.includes(product.id)}
            onProductSelect={() => onProductSelect(product.id)}
          />
        )}
      />
    </div>
  );
};

export default ProductList;
