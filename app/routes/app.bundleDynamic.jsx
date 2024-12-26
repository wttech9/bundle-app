import { useEffect, useState } from "react";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Page,
  ResourceList,
  Checkbox,
  Button,
  InlineStack,
  Text,
  Box,
  Link,
  ResourceItem,
} from "@shopify/polaris";
import "../styles/styles.css"; // Add this for styling
import { Modal, TitleBar } from "@shopify/app-bridge-react";

// Loader Function (Keep it as-is for authentication)
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const products = await fetchAllProducts(admin);

  // products.forEach((product) => {
  //     console.log(`Variants for Product: ${product.title}`);
  //     console.log(
  //       product.variants.map((variant) => ({
  //         id: variant.id,
  //         title: variant.title,
  //         price: variant.price,
  //       }))
  //     );
  //   });
  return products;
};


async function createDraftOrder(admin, selectedProducts, discountPercentage) {
  const lineItems = [];

  // Construct line items with discount applied
  selectedProducts.forEach(({ productId, variantIds }) => {
    variantIds.forEach((variantId) => {
      lineItems.push({
        variantId,
        quantity: 1, // Default quantity
        customAttributes: [], // Add custom attributes if needed
        appliedDiscount: {
          value: discountPercentage,
          valueType: "PERCENTAGE", // Discount type
          title: `${discountPercentage}% off`,
        },
      });
    });
  });

  // GraphQL mutation for creating a draft order
  const mutation = `#graphql
    mutation createDraftOrder($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          invoiceUrl
          lineItems(first: 10) {
            edges {
              node {
                id
                title
                quantity
                discountedTotalSet {
                  presentmentMoney {
                    amount
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lineItems,
      useCustomerDefaultAddress: true, // Optional: Automatically use customer's default address
    },
  };

  // Execute the GraphQL mutation
  const response = await admin.graphql(mutation, { variables });
  const responseJson = await response.json();

  // Check for errors
  if (responseJson.data.draftOrderCreate.userErrors.length > 0) {
    throw new Error(
      responseJson.data.draftOrderCreate.userErrors
        .map((error) => error.message)
        .join(", ")
    );
  }

  // Return the created draft order
  return responseJson.data.draftOrderCreate.draftOrder;
}


export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Parse the submitted JSON data
  const formData = await request.json();
  // console.log(formData.selectedProducts);
  const { selectedProducts, discountPercentage } = formData;

  if (!selectedProducts || !Array.isArray(selectedProducts)) {
    return json({ error: "Invalid product selection data." }, { status: 400 });
  }

  if (typeof discountPercentage !== "number" || discountPercentage <= 0 || discountPercentage > 100) {
    return json({ error: "Invalid discount percentage. It must be between 1 and 100." }, { status: 400 });
  }

  const draftOrder = await createDraftOrder(admin, selectedProducts, discountPercentage);
  // console.log(draftOrder)
  // return json({ draftOrder });
  // // Log product IDs and their selected variant IDs
  // selectedProducts.forEach(({ productId, variantIds }) => {
  //   console.log(`Product ID: ${productId}`);
  //   console.log(`Selected Variant IDs: ${variantIds.join(", ")}`);
  // });

  //return null;
  //  console.log(draftOrder.invoiceUrl);
  // console.log("draft order = ",draftOrder)
  // console.log("draft order json = ",json(draftOrder))
  // console.log("draft order invoice URL = ",json(draftOrder.invoiceUrl))
  return json({
    invoiceUrl: draftOrder.invoiceUrl
});
  
};

// Fetch all products logic remains the same
async function fetchAllProducts(admin) {
  let products = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const response = await admin.graphql(
      `#graphql
            query ($cursor: String) {
                products(first: 50, after: $cursor) {
                    edges {
                        node {
                            id
                            title
                            images(first: 1) {
                                edges {
                                    node {
                                        src
                                    }
                                }
                            }
                            variants(first: 50) {
                                edges {
                                    node {
                                        id
                                        title
                                        price
                                    }
                                }
                            }
                        }
                        cursor
                    }
                    pageInfo {
                        hasNextPage
                    }
                }
                }`,
      {
        variables: { cursor },
      }
    );

    const data = await response.json();
    const {
      data: {
        products: { edges, pageInfo },
      },
    } = data;

    products = [
      ...products,
      ...edges.map((edge) => ({
        id: edge.node.id,
        title: edge.node.title,
        imageSrc: edge.node.images.edges.length
          ? edge.node.images.edges[0].node.src
          : "",
        variants: edge.node.variants.edges.map((variantEdge) => ({
          id: variantEdge.node.id,
          title: variantEdge.node.title,
          price: variantEdge.node.price,
        })),
      })),
    ];

    hasNextPage = pageInfo.hasNextPage;
    cursor = edges.length ? edges[edges.length - 1].cursor : null;
  }

  return products;
}



// React Component
export default function AppIndex() {
  const fetcher = useFetcher();
  const products = useLoaderData();
  const isLoading = ["loading", "submitting"].includes(fetcher.state) && fetcher.formMethod === "POST";

  // const [fetcherData, setFetcherData] = useState(null);

  // useEffect(() => {
  //   if (fetcher.data) {
  //     // Wait for the promise to resolve
  //     fetcher.data.then((data) => {
  //       setFetcherData(data); // Set the resolved data to the state
  //     });
  //   }
  // }, [fetcher.data]);

  // Sort products by title alphabetically

  const sortedProducts = products.sort((a, b) => {
    return a.title.localeCompare(b.title); // Sort alphabetically by product title
  });

  const [selectedVariants, setSelectedVariants] = useState(new Set());
  const [invoiceUrl, setInvoiceUrl] = useState(null); // State to store invoice URL

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
  const selectedProductCount = sortedProducts.reduce((count, product) => {
    if (isProductFullySelected(product) || isProductPartiallySelected(product)) {
      return count + 1;
    }
    return count;
  }, 0);

  // Submit selected variants
  const generateProduct = async () => {
    const selectedData = [];

    sortedProducts.forEach((product) => {
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

    const discountPercentage = 10; // Example: 10%

    fetcher.submit(
      { selectedProducts: selectedData, discountPercentage },
      { method: "POST", encType: "application/json" }
    );

    // console.log(fetcher.data)
    // if (fetcher.data && fetcher.data.invoiceUrl) {
    //   console.log("Invoice URL:", fetcher.data.invoiceUrl);
    // }

    // if (response.ok) {
    //   const { invoiceUrl } = await response.json();
    //   console.log(invoiceUrl);
    // }

  };

  // Render Product with Variants
  const renderProductWithCheckbox = (product) => {
    // If the product has no variants, just render the product with no variant section
    if (!product.variants || product.variants.length === 0) {
      return (
      <ResourceItem>
        <div key={product.id}>
          <div className="product-item">
            <Checkbox
              label={product.title} // Only show the product title
              checked={selectedVariants.has(product.id)} // Check if this product is selected
              onChange={() => handleProductCheckboxChange(product.id, [])} // Handle product checkbox change
            />
            {product.imageSrc && (
              <img
                src={product.imageSrc}
                alt={product.title}
                style={{ width: "100px", height: "100px", objectFit: "cover", }}
              />
            )}
          </div>
        </div>
        </ResourceItem>
      );
    }

    // If the product has variants, render them with checkboxes
    const isChecked = isProductFullySelected(product);
    const isIndeterminate = isProductPartiallySelected(product) ? "indeterminate" : false;

    return (
    <ResourceItem>
      <div key={product.id}>
        <div className="product-item">
          <Checkbox
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {product.imageSrc && (
                  <img
                    src={product.imageSrc}
                    alt={product.title}
                    style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: '8px', borderRadius: "10px" }}
                  />
                )}
                {product.title}
              </div>
            } // Show both image and title
            checked={isChecked || isIndeterminate} // Check if the product is fully selected
            onChange={() =>
              handleProductCheckboxChange(product.id, product.variants) // Handle product checkbox change
            }
          />
        </div>

        {/* Render variants for products that have variants, excluding those with title "Default Title" */}
        {product.variants
          .filter((variant) => variant.title !== "Default Title") // Filter out variants with "Default Title"
          .sort((a, b) => a.title.localeCompare(b.title)) // Sort variants alphabetically
          .map((variant) => (
          <ResourceItem key={variant.id} className="variant-item" >
            <div key={variant.id} className="variant-item">
              <InlineStack alignment="center" spacing="extraTight">
                <Checkbox
                  label={variant.title}
                  checked={selectedVariants.has(variant.id)} // Check if the variant is selected
                  onChange={() => handleVariantCheckboxChange(variant.id)} // Handle variant checkbox change
                />
                <div style={{ marginLeft: "auto" }}>
                  <Text variant="bodyMd">${variant.price}</Text> {/* Display the variant's price */}
                </div>
              </InlineStack>
            </div>
            </ResourceItem>
          ))}
      </div>
      </ResourceItem>
    );
  };

  useEffect(() => {
    if (fetcher.data && fetcher.data.invoiceUrl) {
      setInvoiceUrl(fetcher.data.invoiceUrl);
      shopify.modal.hide("my-modal"); // Close modal only after successful invoice URL retrieval
    }
  }, [fetcher.data]);


  return (
    <Page title="Product Variant Selector">
      <Button onClick={() => shopify.modal.show("my-modal")}>Choose Products</Button>
      <Modal id="my-modal">
        <TitleBar title="Select Product Variants" />
        <div style={{ maxHeight: "380px", overflowY: "auto" }}>
          <ResourceList
            resourceName={{ singular: "product", plural: "products" }}
            items={sortedProducts} // Use sorted products here
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
              loading={isLoading}
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
      {/* {fetcher.data?.invoiceUrl && shopify.modal.hide("my-modal") &&
        (
        <>
          <Link>{fetcher.data.invoiceUrl}</Link>
        </>
      )  
      // {shopify.modal.hide("my-modal")}
      } */}
      {/* {console.log(fetcher.data)} */}
      {invoiceUrl && ( // Display invoice URL only if it exists
        <Link href={invoiceUrl} target="_blank" rel="noopener noreferrer" url={invoiceUrl}>product</Link>
      )}
    </Page>
  );
}