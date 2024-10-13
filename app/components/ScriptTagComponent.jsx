import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";

const ScriptTagComponent = () => {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load("/create-script-tag");
    }
  }, [fetcher]);

  return null; // This component doesn't need to render anything
};

export default ScriptTagComponent;
