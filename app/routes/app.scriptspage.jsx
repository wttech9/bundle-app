// import { authenticate } from "../shopify.server";
// import { json } from "@remix-run/node";
// import { useFetcher } from "@remix-run/react";
// import { useAppBridge } from "@shopify/app-bridge-react";

// export const action = async ({ request }) => {
//     const { admin } = await authenticate.admin(request); // Authenticate and get the admin object

//     // Define your mutation query as a template string
//     const mutation = `#graphql
//       mutation {
//         scriptTagCreate(input: {
//           cache: false,
//           displayScope: ALL,
//           src: "https://d0c6-49-205-246-217.ngrok-free.app/public/alert-script.js"
//         }) {
//           scriptTag {
//             id
//             src
//             displayScope
//           }
//         }
//       }`;

//     // Execute the mutation using the admin.graphql method
//     const response = await admin.graphql(mutation);
//     const responseJson = await response.json(); // Parse the response as JSON

//     // Log the response to verify
//     console.log("Script Tag Response:", responseJson);

//     // Return the response data or handle errors appropriately
//     if (responseJson.errors) {
//         console.error("GraphQL errors:", responseJson.errors);
//         throw new Error("Failed to create script tag");
//     }

//     // Return the created script tag data
//     return json({
//         scriptTag: responseJson.data.scriptTagCreate.scriptTag,
//     });
// };

// export const loader = async ({ request }) => {
//     await authenticate.admin(request);
//     return null;
// };

// export function ScriptsPage() {
//     const fetcher = useFetcher();
//     const shopify = useAppBridge();
//     return (
//         <div>
//             This is the Scripts page
//             {/* You can render the created script tag info here if needed */}
//         </div>
//     );
// }

// export default ScriptsPage;
// import React, { useState, useCallback } from "react";
// import {
//     Page,
//     Layout,
//     Modal,
//     ResourceList,
//     ResourceItem,
//     Thumbnail,
//     Checkbox,
//     TextField,
//     Button,
// } from "@shopify/polaris";
// import { useLoaderData } from "@remix-run/react";
// import { authenticate } from "../shopify.server";

// // Helper function to fetch all products
// async function fetchAllProducts(admin) {
//     let products = [];
//     let hasNextPage = true;
//     let cursor = null;

//     while (hasNextPage) {
//         const response = await admin.graphql(
//             `#graphql
//             query ($cursor: String) {
//                 products(first: 50, after: $cursor) {
//                     edges {
//                         node {
//                             id
//                             title
//                             images(first: 1) {
//                                 edges {
//                                     node {
//                                         src
//                                     }
//                                 }
//                             }
//                         }
//                         cursor
//                     }
//                     pageInfo {
//                         hasNextPage
//                     }
//                 }
//             }`,
//             {
//                 variables: { cursor },
//             }
//         );

//         const data = await response.json();
//         const {
//             data: {
//                 products: { edges, pageInfo },
//             },
//         } = data;

//         products = [
//             ...products,
//             ...edges.map((edge) => ({
//                 id: edge.node.id,
//                 title: edge.node.title,
//                 imageSrc: edge.node.images.edges.length
//                     ? edge.node.images.edges[0].node.src
//                     : "",
//             })),
//         ];

//         hasNextPage = pageInfo.hasNextPage;
//         cursor = edges.length ? edges[edges.length - 1].cursor : null;
//     }

//     return products;
// }

// export async function loader({ request }) {
//     const { admin } = await authenticate.admin(request);
//     const products = await fetchAllProducts(admin);
//     return products;
// }

// const Products = () => {
//     const products = useLoaderData();
//     const [selectedProducts, setSelectedProducts] = useState([]);
//     const [modalActive, setModalActive] = useState(false);
//     const [searchQuery, setSearchQuery] = useState("");

//     // Toggle Modal
//     const toggleModal = useCallback(() => setModalActive(!modalActive), [modalActive]);

//     // Search Filter
//     const handleSearchChange = useCallback((value) => setSearchQuery(value), []);
//     const filteredProducts = products.filter((product) =>
//         product.title.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     const handleProductSelection = (productId) => {
//         setSelectedProducts((prevSelected) =>
//             prevSelected.includes(productId)
//                 ? prevSelected.filter((id) => id !== productId)
//                 : [...prevSelected, productId]
//         );
//     };

//     return (
//         <Page fullWidth>
//             <div style={{ maxWidth: "800px", margin: "0 auto" }}>
//                 <Layout>
//                     <Layout.Section>
//                         <Button onClick={toggleModal}>Select Products</Button>

//                         {/* Modal with Product List */}
//                         <Modal
//                             open={modalActive}
//                             onClose={toggleModal}
//                             title="Select Products"
//                             primaryAction={{
//                                 content: "Confirm Selection",
//                                 onAction: () => {
//                                     console.log(`Selected products: ${selectedProducts}`);
//                                     toggleModal();
//                                 },
//                             }}
//                             secondaryActions={[
//                                 {
//                                     content: "Cancel",
//                                     onAction: toggleModal,
//                                 },
//                             ]}
//                         >
//                             <Modal.Section>
//                                 {/* Search Bar */}
//                                 <TextField
//                                     value={searchQuery}
//                                     onChange={handleSearchChange}
//                                     autoComplete="off"
//                                     placeholder="Search Products"
//                                 />
//                                 {/* Scrollable Product List */}
//                                 <div style={{ height: "300px", overflowY: "scroll", marginTop: "10px" }}>
//                                     <ResourceList
//                                         resourceName={{ singular: "product", plural: "products" }}
//                                         items={filteredProducts}
//                                         renderItem={(product) => {
//                                             const { id, title, imageSrc } = product;
//                                             const isChecked = selectedProducts.includes(id);
//                                             return (
//                                                 <ResourceItem
//                                                     id={id}
//                                                     media={<Thumbnail source={imageSrc || ""} alt={title} />}
//                                                     accessibilityLabel={`Select ${title}`}
//                                                 >
//                                                     {/* Reduce height of each row */}
//                                                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "50px" }}>
//                                                         <div style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
//                                                         <Checkbox
//                                                             checked={isChecked}
//                                                             onChange={() => handleProductSelection(id)}
//                                                         />
//                                                     </div>
//                                                 </ResourceItem>
//                                             );
//                                         }}
//                                     />
//                                 </div>
//                             </Modal.Section>
//                         </Modal>
//                     </Layout.Section>
//                 </Layout>
//             </div>
//         </Page>
//     );
// };
// app/routes/app.index.jsx
// import React, { useState, useCallback } from "react";
// import { Page, Layout } from "@shopify/polaris";
// import { useLoaderData } from "@remix-run/react";
// import { authenticate } from "../shopify.server";
// import ProductModal from "../components/ProductModal";
// import SelectButton from "../components/SelectButton";

// // Fetch all products logic remains the same
// async function fetchAllProducts(admin) {
//   let products = [];
//   let hasNextPage = true;
//   let cursor = null;

//   while (hasNextPage) {
//     const response = await admin.graphql(
//       `#graphql
//       query ($cursor: String) {
//         products(first: 50, after: $cursor) {
//           edges {
//             node {
//               id
//               title
//               images(first: 1) {
//                 edges {
//                   node {
//                     src
//                   }
//                 }
//               }
//             }
//             cursor
//           }
//           pageInfo {
//             hasNextPage
//           }
//         }
//       }`,
//       {
//         variables: { cursor },
//       }
//     );

//     const data = await response.json();
//     const {
//       data: {
//         products: { edges, pageInfo },
//       },
//     } = data;

//     products = [
//       ...products,
//       ...edges.map((edge) => ({
//         id: edge.node.id,
//         title: edge.node.title,
//         imageSrc: edge.node.images.edges.length
//           ? edge.node.images.edges[0].node.src
//           : "",
//       })),
//     ];

//     hasNextPage = pageInfo.hasNextPage;
//     cursor = edges.length ? edges[edges.length - 1].cursor : null;
//   }

//   return products;
// }

// export async function loader({ request }) {
//   const { admin } = await authenticate.admin(request);
//   const products = await fetchAllProducts(admin);
//   return products;
// }

// const Products = () => {
//   const products = useLoaderData();
//   const [selectedProducts, setSelectedProducts] = useState([]);
//   const [modalActive, setModalActive] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   // Toggle Modal
//   const toggleModal = useCallback(() => setModalActive(!modalActive), [modalActive]);

//   // Search Filter
//   const handleSearchChange = useCallback((value) => setSearchQuery(value), []);
//   const filteredProducts = products.filter((product) =>
//     product.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleProductSelection = (productId) => {
//     setSelectedProducts((prevSelected) =>
//       prevSelected.includes(productId)
//         ? prevSelected.filter((id) => id !== productId)
//         : [...prevSelected, productId]
//     );
//   };

//   const handleConfirmSelection = () => {
//     console.log(`Selected products: ${selectedProducts}`);
//     toggleModal();
//   };



//   return (
//     <Page fullWidth>
//       <div style={{ maxWidth: "800px", margin: "0 auto" }}>
//         <Layout>
//           <Layout.Section>
//             <SelectButton onClick={toggleModal} />
//             <ProductModal
//               isOpen={modalActive}
//               onClose={toggleModal}
//               searchQuery={searchQuery}
//               onSearchChange={handleSearchChange}
//               products={filteredProducts}
//               selectedProducts={selectedProducts}
//               onProductSelect={handleProductSelection}
//               onConfirmSelection={handleConfirmSelection}
//             />
//           </Layout.Section>
//         </Layout>
//       </div>
//     </Page>
//   );
// };

// export default Products;

// import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
    Page,
} from "@shopify/polaris";
import { TitleBar,  } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    const response = await admin.graphql(
        `#graphql
      mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
          scriptTag {
            cache
            displayScope
            src
          }
        }
      }`,
        {
            variables: {
                input: {
                    cache: false,
                    displayScope: "ALL",
                    src: "https://d0c6-49-205-246-217.ngrok-free.app/public/alert-script.js"
                },
            },
        },
    );
    const responseJson = await response.json();
    console.log(responseJson.data);
    return(responseJson.data);
    //return null;
};

export const action = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    // const color = ["Red", "Orange", "Yellow", "Green"][
    //   Math.floor(Math.random() * 4)
    // ];
    const response = await admin.graphql(
        `#graphql
      mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
          scriptTag {
            cache
            displayScope
            src
          }
        }
      }`,
        {
            variables: {
                input: {
                    cache: false,
                    displayScope: "ALL",
                    src: "https://d0c6-49-205-246-217.ngrok-free.app/public/alert-script.js"
                },
            },
        },
    );
    const responseJson = await response.json();
    console.log(responseJson.data);
    return(responseJson.data);
};

export default function Index() {
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state === "submitting";

    const generateProduct = () => fetcher.submit({}, { method: "POST" });

    return (
        <Page>
            <TitleBar title="Remix app template">
                <button onClick={generateProduct} disabled={isSubmitting}>
                    {isSubmitting ? "Generating..." : "Generate a product"}
                </button>
            </TitleBar>
        </Page>
    );
}

