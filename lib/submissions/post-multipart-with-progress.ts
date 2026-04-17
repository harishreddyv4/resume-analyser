/**
 * POST multipart `FormData` with XMLHttpRequest so `upload.onprogress` can drive a real progress bar.
 * Progress reflects bytes sent from the browser to your API (then the server streams to Supabase).
 */
export type MultipartProgressResult = {
  ok: boolean;
  status: number;
  bodyText: string;
  /** True when the browser could not complete the request (offline, CORS, aborted, etc.). */
  networkError?: boolean;
};

export function postMultipartFormWithProgress(
  url: string,
  formData: FormData,
  options: {
    onProgress: (percent: number) => void;
    signal?: AbortSignal;
  },
): Promise<MultipartProgressResult> {
  const { onProgress, signal } = options;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    let settled = false;

    const finish = (result: MultipartProgressResult) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(result);
    };

    const onAbort = () => {
      xhr.abort();
      onProgress(0);
      finish({
        ok: false,
        status: 0,
        bodyText: "",
        networkError: true,
      });
    };

    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }

    xhr.open("POST", url);
    xhr.responseType = "text";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }
      const raw = (event.loaded / event.total) * 92;
      onProgress(Math.min(92, Math.round(raw)));
    };

    xhr.onload = () => {
      onProgress(100);
      finish({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        bodyText: xhr.responseText ?? "",
        networkError: false,
      });
    };

    xhr.onerror = () => {
      onProgress(0);
      finish({
        ok: false,
        status: xhr.status || 0,
        bodyText: xhr.responseText ?? "",
        networkError: true,
      });
    };

    xhr.onabort = () => {
      onProgress(0);
      finish({
        ok: false,
        status: 0,
        bodyText: "",
        networkError: true,
      });
    };

    xhr.send(formData);
  });
}
