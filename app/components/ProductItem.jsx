// app/components/ProductItem.jsx
import React from "react";
import { ResourceItem, Thumbnail, Checkbox } from "@shopify/polaris";

const ProductItem = ({ id, title, imageSrc, isChecked, onProductSelect }) => {
  return (
    <ResourceItem
      id={id}
      media={<Thumbnail source={imageSrc || ""} alt={title} />}
      accessibilityLabel={`Select ${title}`}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "50px" }}>
        <div style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </div>
        <Checkbox checked={isChecked} onChange={onProductSelect} />
      </div>
    </ResourceItem>
  );
};

export default ProductItem;
