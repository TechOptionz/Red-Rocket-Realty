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
