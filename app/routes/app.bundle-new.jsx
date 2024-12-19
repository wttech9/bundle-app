import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import {useAppBridge } from "@shopify/app-bridge-react";

export default function CreateBundle() {
    
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [products, setProducts] = useState([]); // Products fetched from Shopify
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discount, setDiscount] = useState("");

  // Handle product fetch
  const handleFetchProducts = () => {
    fetcher.submit({ intent: "fetchProducts" }, { method: "POST" });
  };

  // Update products when fetcher gets data
  if (fetcher.data?.products && products.length === 0) {
    setProducts(fetcher.data.products);
  }

  const handleSelectProduct = (product) => {
    setSelectedProducts((prev) => [...prev, product]);
  };

  const handleSaveBundle = () => {
    fetcher.submit(
      { intent: "saveBundle", discount, products: JSON.stringify(selectedProducts) },
      { method: "POST" }
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create Bundle</h1>

      {/* Input Discount Percentage */}
      <div className="mb-4">
        <label className="block">Discount Percentage:</label>
        <input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Select Products Button */}
      <button
        onClick={handleFetchProducts}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Select Products
      </button>

      {/* Show Product List */}
      {products.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Select Products:</h2>
          {products.map((product) => (
            <div key={product.id} className="border p-2 mb-2">
              <h3>{product.title}</h3>
              <ul>
                {product.variants.map((variant) => (
                  <li key={variant.id}>
                    <span>{variant.title} - ${variant.price}</span>
                    <button
                      onClick={() => handleSelectProduct(variant)}
                      className="ml-2 text-green-600"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Save Bundle */}
      <button
        onClick={handleSaveBundle}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Save Bundle
      </button>
    </div>
  );
}
