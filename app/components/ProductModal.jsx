// app/components/ProductModal.jsx
import React from "react";
import { Modal } from "@shopify/polaris";
import ProductList from "./ProductList";
import SearchBar from "./SearchBar";

const ProductModal = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  products,
  selectedProducts,
  onProductSelect,
  onConfirmSelection,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Select Products"
      primaryAction={{
        content: "Confirm Selection",
        onAction: onConfirmSelection,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
        <ProductList
          products={products}
          selectedProducts={selectedProducts}
          onProductSelect={onProductSelect}
        />
      </Modal.Section>
    </Modal>
  );
};

export default ProductModal;
