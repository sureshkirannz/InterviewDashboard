import { WorkflowStorage } from "./storage-durable-object";

export { WorkflowStorage };

export interface Env {
  WORKFLOW_STORAGE: DurableObjectNamespace;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const id = env.WORKFLOW_STORAGE.idFromName("global");
      const stub = env.WORKFLOW_STORAGE.get(id);
      
      const apiPath = url.pathname.replace("/api", "");
      const apiUrl = new URL(apiPath, url.origin);
      apiUrl.search = url.search;
      
      const clonedRequest = request.clone();
      const apiRequest = new Request(apiUrl.toString(), {
        method: clonedRequest.method,
        headers: clonedRequest.headers,
        body: clonedRequest.body,
      });
      
      return stub.fetch(apiRequest);
    }

    if (url.pathname === "/ws") {
      const id = env.WORKFLOW_STORAGE.idFromName("global");
      const stub = env.WORKFLOW_STORAGE.get(id);
      return stub.fetch(request);
    }

    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      const pathname = url.pathname;
      if (!pathname.includes('.')) {
        try {
          return await env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
        } catch (e) {}
      }
      return new Response("Not Found", { status: 404 });
    }
  },
};
