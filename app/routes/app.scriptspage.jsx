import { useFetcher } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    return null; // Remove the script tag creation from the loader to avoid running it on page load.
};

export const action = async ({ request }) => {
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
                    displayScope: "ONLINE_STORE",
                    src: "https://cd01-49-205-246-217.ngrok-free.app/alert-script.js"
                },
            },
        }
    );

    const responseJson = await response.json();
    console.log(responseJson.data);
    return responseJson.data; // Return the response data from the action.
};

export default function Index() {
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state === "submitting";

    // Function to handle script tag creation on button click
    const generateScriptTag = () => {
        fetcher.submit({}, { method: "post" }); // Call action method on submit
    };

    return (
        <Page>
            <h1 className="text-5xl font-bold underline">Hello world!</h1>
            <TitleBar title="Remix app template">
                <button onClick={generateScriptTag} disabled={isSubmitting}>
                    {isSubmitting ? "Creating Script Tag..." : "Create Script Tag"}
                </button>
            </TitleBar>
            {fetcher.data && (
                <div>
                    <p>Script Tag Created:</p>
                    <pre>{JSON.stringify(fetcher.data, null, 2)}</pre>
                </div>
            )}
        </Page>
    );
}