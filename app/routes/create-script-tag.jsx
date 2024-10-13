// import { json } from '@remix-run/node';
// import { getSession } from '~/sessions'; // Adjust based on your session management

// export const action = async ({ request }) => {
//     const session = await getSession(request.headers.get('Cookie'));
//     const shop = session.get('shop'); // Get the shop domain from the session

//     const scriptTagUrl = 'https://d0c6-49-205-246-217.ngrok-free.app/public/alert-script.js'; // URL to the alert script

//     const response = await fetch(`https://${shop}/admin/api/2023-07/script_tags.json`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-Shopify-Access-Token': session.get('accessToken'), // Access token for authentication
//         },
//         body: JSON.stringify({
//             script_tag: {
//                 event: 'onload',
//                 src: scriptTagUrl,
//             },
//         }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//         return json({ success: true, data });
//     } else {
//         return json({ success: false, error: data.errors });
//     }
// };
