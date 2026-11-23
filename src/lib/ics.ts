import type { Listing } from "@/data/rr-data";

export const icsEvent = (p: Listing, label: string) =>
  [
    "BEGIN:VEVENT",
    "SUMMARY:Inspection · " + p.address + ", " + p.suburb,
    "DESCRIPTION:" + label + " · Red Rocket Realty 07 3340 4200",
    "LOCATION:" + p.address + ", " + p.suburb + " QLD",
    "END:VEVENT",
  ].join("\r\n");

export const icsFile = (events: string[], prodId = "Inspection") =>
  "data:text/calendar;charset=utf-8," +
  encodeURIComponent(
    ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Red Rocket Realty//" + prodId + "//EN"].concat(events, ["END:VCALENDAR"]).join("\r\n"),
  );

export const icsFor = (p: Listing, label: string) => icsFile([icsEvent(p, label)]);

const icsStamp = (t: number | string) => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/[\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");

/** A real, timed calendar event for a feed inspection (start/end are ISO instants). */
export const icsTimedEvent = (p: Listing, start: string, end: string, kind = "Inspection", stamp: number | string = start) =>
  [
    "BEGIN:VEVENT",
    "UID:" + (p.listingId || p.id) + "-" + icsStamp(start) + "@redrocketrealty.com.au",
    "DTSTAMP:" + icsStamp(stamp), // passed in (not Date.now()) so server and client render identical hrefs
    "DTSTART:" + icsStamp(start),
    "DTEND:" + icsStamp(end),
    "SUMMARY:" + icsText(kind + " · " + p.address + ", " + p.suburb),
    "DESCRIPTION:" + icsText("Red Rocket Realty · 07 3340 4200"),
    "LOCATION:" + icsText(p.address + ", " + p.suburb + " " + (p.state || "QLD") + (p.postcode ? " " + p.postcode : "")),
    "END:VEVENT",
  ].join("\r\n");
