import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Bell, History, BookOpen } from "lucide-react";
import { api } from "../api/client";

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("bookmarks");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listBookmarks().catch(() => []),
      api.listSubscriptions().catch(() => []),
      api.getHistory().catch(() => []),
    ]).then(([bm, subs, hist]) => {
      setBookmarks(bm);
      setSubscriptions(subs);
      setHistory(hist);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><div className="skeleton rounded-xl h-64" /></div>;
  }

  const tabs = [
    { id: "bookmarks", label: "Bookmarks", icon: <Bookmark size={16} />, count: bookmarks.length },
    { id: "subscriptions", label: "Subscriptions", icon: <Bell size={16} />, count: subscriptions.length },
    { id: "history", label: "History", icon: <History size={16} />, count: history.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink-50 mb-6">Dashboard</h1>

      <div className="flex gap-1 mb-6 border-b border-ink-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${tab === t.id ? "border-brand-500 text-brand-400" : "border-transparent text-ink-400 hover:text-ink-200"}`}
          >
            {t.icon}
            {t.label}
            <span className="text-xs bg-ink-800 px-1.5 rounded">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "bookmarks" && <SeriesGrid items={bookmarks} emptyText="No bookmarks yet." />}
      {tab === "subscriptions" && <SeriesGrid items={subscriptions} emptyText="No subscriptions yet." showUnread />}
      {tab === "history" && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-ink-400 text-center py-12">No reading history yet.</p>
          ) : (
            history.map((h, i) => (
              <Link key={i} to={`/read/${h.series_slug}/${h.chapter_slug}`} className="flex items-center justify-between bg-ink-900 hover:bg-ink-800 border border-ink-800 rounded-lg px-4 py-3 transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-brand-400" />
                  <div>
                    <p className="text-ink-200 text-sm">{h.series_title}</p>
                    <p className="text-ink-500 text-xs">Ch. {h.chapter_number} {h.chapter_title || ""}</p>
                  </div>
                </div>
                <span className="text-xs text-ink-500">{new Date(h.read_at).toLocaleDateString()}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SeriesGrid({ items, emptyText, showUnread }) {
  if (items.length === 0) {
    return <p className="text-ink-400 text-center py-12">{emptyText}</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Link key={item.id} to={`/series/${item.series_slug}`} className="group">
          <div className="relative rounded-xl overflow-hidden bg-ink-900 aspect-[2/3] mb-2 border border-ink-800 group-hover:border-brand-500 transition-colors">
            {item.series_cover ? (
              <img src={`/images/${item.series_cover}`} alt={item.series_title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-600 text-4xl font-bold">{item.series_title[0]}</div>
            )}
            {showUnread && item.unread_count > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">{item.unread_count}</span>
            )}
          </div>
          <h3 className="text-sm text-ink-200 group-hover:text-brand-400 transition-colors line-clamp-1">{item.series_title}</h3>
        </Link>
      ))}
    </div>
  );
}
