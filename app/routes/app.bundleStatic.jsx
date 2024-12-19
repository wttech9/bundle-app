import React, { useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  ResourceList,
  Checkbox,
  Button,
  InlineStack,
  Text,
  Box,
} from "@shopify/polaris";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import "../styles/styles.css"; // Add this for styling
import { authenticate } from "../shopify.server";

// Server-side Action
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Parse the submitted JSON data
  const formData = await request.json();
  console.log(formData);
  const { selectedProducts } = formData;

  // Log product IDs and their selected variant IDs
  selectedProducts.forEach(({ productId, variantIds }) => {
    console.log(`Product ID: ${productId}`);
    console.log(`Selected Variant IDs: ${variantIds.join(", ")}`);
  });

  return null;
};

export default function ProductVariantSelector() {
  const fetcher = useFetcher();

  const [products] = useState([
    {
      id: "1",
      title: "Orange Snowboard",
      variants: [
        { id: "1-1", title: "Small", price: "100.00" },
        { id: "1-2", title: "Medium", price: "110.00" },
        { id: "1-3", title: "Large", price: "120.00" },
      ],
    },
    {
      id: "2",
      title: "Blue Snowboard",
      variants: [
        { id: "2-1", title: "Large", price: "120.00" },
        { id: "2-2", title: "Extra Large", price: "130.00" },
      ],
    },
    {
      id: "3",
      title: "Orange Snowboard",
      variants: [
        { id: "3-1", title: "Small", price: "100.00" },
        { id: "3-2", title: "Medium", price: "110.00" },
        { id: "3-3", title: "Large", price: "120.00" },
      ],
    },
    {
      id: "4",
      title: "Orange Snowboard",
      variants: [
        { id: "4-1", title: "Small", price: "100.00" },
        { id: "4-2", title: "Medium", price: "110.00" },
        { id: "4-3", title: "Large", price: "120.00" },
      ],
    },
  ]);

  const [selectedVariants, setSelectedVariants] = useState(new Set());

  // Handle variant selection
  const handleVariantCheckboxChange = (variantId) => {
    const newSelected = new Set(selectedVariants);
    newSelected.has(variantId)
      ? newSelected.delete(variantId)
      : newSelected.add(variantId);
    setSelectedVariants(newSelected);
  };

  // Handle product selection
  const handleProductCheckboxChange = (productId, variants) => {
    const newSelected = new Set(selectedVariants);

    const productVariantIds = variants.map((variant) => variant.id);
    const allVariantsSelected = productVariantIds.every((id) =>
      newSelected.has(id)
    );

    if (allVariantsSelected) {
      productVariantIds.forEach((id) => newSelected.delete(id));
    } else {
      productVariantIds.forEach((id) => newSelected.add(id));
    }

    setSelectedVariants(newSelected);
  };

  // Check product states
  const isProductFullySelected = (product) =>
    product.variants.every((variant) => selectedVariants.has(variant.id));

  const isProductPartiallySelected = (product) =>
    product.variants.some((variant) => selectedVariants.has(variant.id)) &&
    !isProductFullySelected(product);

  // Count selected products
  const selectedProductCount = products.reduce((count, product) => {
    if (isProductFullySelected(product) || isProductPartiallySelected(product)) {
      return count + 1;
    }
    return count;
  }, 0);

  // Submit selected variants
  const generateProduct = () => {
    const selectedData = [];

    products.forEach((product) => {
      const selectedVariantIds = product.variants
        .filter((variant) => selectedVariants.has(variant.id))
        .map((variant) => variant.id);

      if (selectedVariantIds.length > 0) {
        selectedData.push({
          productId: product.id,
          variantIds: selectedVariantIds,
        });
      }
    });

    fetcher.submit(
      { selectedProducts: selectedData },
      { method: "POST", encType: "application/json" }
    );
  };

  // Render Product with Variants
  const renderProductWithCheckbox = (product) => {
    const isChecked = isProductFullySelected(product);
    const isIndeterminate = isProductPartiallySelected(product)
      ? "indeterminate"
      : false;

    return (
      <div key={product.id}>
        <div className="product-item">
          <Checkbox
            label={product.title}
            checked={isChecked || isIndeterminate}
            onChange={() => handleProductCheckboxChange(product.id, product.variants)}
          />
        </div>
        {product.variants.map((variant) => (
          <div key={variant.id} className="variant-item">
            <InlineStack alignment="center" spacing="extraTight">
              <Checkbox
                label={variant.title}
                checked={selectedVariants.has(variant.id)}
                onChange={() => handleVariantCheckboxChange(variant.id)}
              />
              <div style={{ marginLeft: "auto" }}>
                <Text variant="bodyMd">${variant.price}</Text>
              </div>
            </InlineStack>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Page title="Product Variant Selector">
      <Button onClick={() => shopify.modal.show("my-modal")}>Choose Products</Button>
      <Modal id="my-modal">
        <TitleBar title="Select Product Variants" />
        <div style={{ maxHeight: "380px", overflowY: "auto" }}>
          <ResourceList
            resourceName={{ singular: "product", plural: "products" }}
            items={products}
            renderItem={renderProductWithCheckbox}
          />
        </div>
        <Box
          style={{
            boxShadow: "0 -1px 20px rgba(0, 0, 0, 0.15)",
            padding: "16px 16px",
          }}
          padding="400"
        >
          <InlineStack align="space-between" spacing="extraTight">
            <Text style={{ padding: "4px 4px" }} variant="bodyMd">
              {selectedProductCount}{" "}
              {selectedProductCount === 1 ? "product" : "products"} selected
            </Text>
            <Button
              primary
              size="slim"
              onClick={generateProduct}
              style={{ backgroundColor: "black", color: "white" }}
            >
              Add
            </Button>
          </InlineStack>
        </Box>
      </Modal>
    </Page>
  );
}