interface EventData {
  _id: string;
  session_id: string;
  event_type: "page_view" | "click";
  page_url: string;
  timestamp: string;
  click_x: number | null;
  click_y: number | null;
  target_tag?: string | null;
  target_text?: string | null;
}

interface EventTimelineProps {
  events: EventData[];
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <div className="text-5xl mb-4 opacity-50">📭</div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No Events
        </h3>
        <p className="text-sm">No events found for this session.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <p className="text-xs text-muted-foreground mb-5 font-medium">
        {formatDate(events[0].timestamp)} · {events.length} events
      </p>

      <div className="relative pl-8">
        <div className="absolute left-[9px] top-0 bottom-0 w-px bg-border" />

        {events.map((event, index) => (
          <div
            key={event._id}
            className="relative pb-6 animate-slide-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`
                absolute -left-[27px] top-[14px]
                w-2.5 h-2.5 rounded-full ring-4 ring-white
                ${event.event_type === "click" ? "bg-emerald-600" : "bg-black"}
              `}
            />

            <div className="rounded-lg border border-border bg-white px-4 py-3 hover:bg-[#f6f8f6] transition-colors">
              <div className="text-[0.7rem] text-muted-foreground font-medium mb-1.5">
                {formatTime(event.timestamp)}
              </div>

              <div className="flex items-start flex-col gap-2 mb-2">
                {event.event_type === "page_view" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                    Page View
                  </span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Click
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        ({event.click_x}, {event.click_y})
                      </span>
                    </div>
                    {(event.target_text || event.target_tag) && (
                      <div className="text-sm bg-gray-50 border border-gray-100 rounded px-2.5 py-1.5 mt-1">
                        <span className="text-muted-foreground">
                          Clicked on{" "}
                        </span>
                        {event.target_tag && (
                          <span className="font-mono text-xs text-pink-600 bg-pink-50 px-1 py-0.5 rounded mx-1">
                            &lt;{event.target_tag}&gt;
                          </span>
                        )}
                        {event.target_text && (
                          <span className="font-medium text-foreground">
                            "
                            {event.target_text.length > 50
                              ? event.target_text.substring(0, 50) + "..."
                              : event.target_text}
                            "
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className="text-xs text-muted-foreground truncate font-mono"
                title={event.page_url}
              >
                {event.page_url
                  .replace("http://127.0.0.1:5500", "")
                  .replace("http://localhost:5174", "") || event.page_url}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
