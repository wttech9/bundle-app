// app/components/SelectButton.jsx
import React from "react";
import { Button } from "@shopify/polaris";

const SelectButton = ({ onClick }) => {
  return <Button onClick={onClick}>Select Products</Button>;
};

export default SelectButton;
