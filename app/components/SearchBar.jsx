// app/components/SearchBar.jsx
import React from "react";
import { TextField } from "@shopify/polaris";

const SearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <TextField
      value={searchQuery}
      onChange={onSearchChange}
      autoComplete="off"
      placeholder="Search Products"
    />
  );
};

export default SearchBar;
