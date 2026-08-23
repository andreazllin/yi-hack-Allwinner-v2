import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("#root element missing from index.html");
}

createRoot(rootElement).render(
	<StrictMode>
		<p>yi-hack panel</p>
	</StrictMode>,
);
