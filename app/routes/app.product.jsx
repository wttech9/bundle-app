import { json } from '@remix-run/node';
import { authenticatedFetch } from '@shopify/app-bridge-utils'; // For authenticated requests

export const action = async ({ request }) => {
  const appBridge = useAppBridge();
  const authenticatedFetchInstance = authenticatedFetch(appBridge); // Get the authenticated fetch instance

  const shop = new URL(request.url).searchParams.get('shop'); // Get the shop from the query
  const scriptSrc = 'https://08c7-49-205-246-217.ngrok-free.app/alert-script.js'; // Change to your script URL

  const response = await authenticatedFetchInstance(`https://${shop}/admin/api/2023-04/script_tags.json`, {
    method: 'POST',
    body: JSON.stringify({
      script_tag: {
        event: 'onload',
        src: scriptSrc,
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return json({ error: 'Failed to create script tag' }, { status: 500 });
  }

  return json({ success: true });
};
