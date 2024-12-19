// app/routes/submit-selection.js
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    await authenticate.admin(request);
  
    return null;
  };

export const action = async ({ request }) => {
  // Parse the incoming form data
  const formData = new URLSearchParams(await request.text());
  const selectedProducts = JSON.parse(formData.get("selectedProducts"));

  // Log the selected products and variants to the terminal
  console.log("Selected Products:", selectedProducts);

  // If you want to save it to a database, you can do it here

  // Respond back with a success message
  return json({ status: "success", message: "Selected products logged" });
};
