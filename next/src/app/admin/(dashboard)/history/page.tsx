"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type ApiHistoryData = {
  _id: string;
  url: string;
  request: {
    method: string;
    remoteAddress: string;
    startTime: string;
    body: Record<string, unknown>;
  };
  response: {
    statusCode: string;
    responseTime: number;
    body: Record<string, unknown>;
  };
};

type SelectedBody =
  | { type: "request"; data: Record<string, unknown> }
  | { type: "response"; data: Record<string, unknown> };

const formatTime = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "short",
    timeStyle: "medium",
  });

export default function ApiHistoryPage() {
  const [allData, setAllData] = useState<ApiHistoryData[]>([]);
  const [displayData, setDisplayData] = useState<ApiHistoryData[]>([]);
  const [selected, setSelected] = useState<SelectedBody | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const itemsPerLoad = 30;
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/admin/api-history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (Array.isArray(data.data)) {
        setAllData(data.data);
        setDisplayData(data.data.slice(0, itemsPerLoad));
        setHasMore(data.data.length > itemsPerLoad);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [itemsPerLoad]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;

    const nextItems = allData.slice(
      displayData.length,
      displayData.length + itemsPerLoad
    );

    setDisplayData((prev) => [...prev, ...nextItems]);
    setHasMore(displayData.length + nextItems.length < allData.length);
  }, [allData, displayData, hasMore, itemsPerLoad, loading]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore();
    }
  }, [hasMore, loadMore, loading]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">API History</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div
        className="overflow-y-auto border rounded-lg shadow-sm h-[500px]"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <table className="min-w-full table-auto text-sm text-left">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">URL</th>
              <th className="px-4 py-2">Start Time</th>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Remote Addr</th>
              <th className="px-4 py-2">Resp Time</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((entry) => (
              <tr key={entry._id} className="border-t">
                <td className="px-4 py-2 max-w-xs truncate" title={entry.url}>
                  {entry.url}
                </td>
                <td className="px-4 py-2">{formatTime(entry.request.startTime)}</td>
                <td className="px-4 py-2">{entry.request.method}</td>
                <td className="px-4 py-2">{entry.response.statusCode}</td>
                <td className="px-4 py-2">{entry.request.remoteAddress}</td>
                <td className="px-4 py-2">{entry.response.responseTime} ms</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    onClick={() =>
                      setSelected({ type: "request", data: entry.request.body })
                    }
                  >
                    View Req
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                    onClick={() =>
                      setSelected({ type: "response", data: entry.response.body })
                    }
                  >
                    View Res
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        )}
        {!hasMore && (
          <div className="p-4 text-center text-gray-400 text-sm">
            No more data to load
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-6 border rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">
            {selected.type === "request" ? "Request Body" : "Response Body"}
          </h2>
          <pre className="bg-white p-3 text-xs overflow-auto rounded whitespace-pre-wrap">
            {JSON.stringify(selected.data, null, 2)}
          </pre>
          <button
            className="mt-2 px-4 py-1 bg-gray-300 text-sm rounded"
            onClick={() => setSelected(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
