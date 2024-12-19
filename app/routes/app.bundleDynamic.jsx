import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { authenticate } from "../shopify.server";

// GraphQL Query to Fetch Products
const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          images(first: 1) {
            edges {
              node {
                src
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
              }
            }
          }
        }
      }
    }
  }
`;

// Loader Function (Keep it as-is for authentication)
export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

// Action Function to Fetch Products
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request); // Authenticates and retrieves admin client

  try {
    // Execute GraphQL Query using Admin GraphQL Client
    const response = await admin.graphql(GET_PRODUCTS_QUERY, { variables: { first: 10 } });

    // Extract and log product data
    const products = response.data.products.edges.map((edge) => edge.node);
    console.log("Fetched Products:", products);

    // Return products to the client
    return json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

// React Component
export default function AppIndex() {
  const fetcher = useFetcher();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Fetch Products</h1>
      <fetcher.Form method="post">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sync Products
        </button>
      </fetcher.Form>

      {/* Display Products */}
      {fetcher.data?.products && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Fetched Products:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(fetcher.data.products, null, 2)}
          </pre>
        </div>
      )}

      {/* Display Error */}
      {fetcher.data?.error && (
        <p className="text-red-500 mt-4">Error: {fetcher.data.error}</p>
      )}
    </div>
  );
}
