// Static content only. Hotels, bookings and reviews now come from the API.
const u = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const cities = ["Karachi", "Lahore", "Islamabad", "Murree", "Hunza", "Tharparkar"];

export const types = ["Hotel", "Lodge", "Heritage", "Resort", "Inn", "Camp"];

export const destinations = [
  { city: "Hunza", image: u("photo-1506905925346-21bda4d32df4") },
  { city: "Murree", image: u("photo-1564501049412-61c2a3083791") },
  { city: "Karachi", image: u("photo-1507525428034-b723cf961d3e") },
  { city: "Lahore", image: u("photo-1542314831-068cd1dbfeeb") },
  { city: "Islamabad", image: u("photo-1571896349842-33c89424de2d") },
];

export const propertyTypes = [
  { name: "Hotel", image: u("photo-1566073771259-6a8506099945", 600) },
  { name: "Resort", image: u("photo-1520250497591-112f2f40a3f4", 600) },
  { name: "Heritage", image: u("photo-1542314831-068cd1dbfeeb", 600) },
  { name: "Lodge", image: u("photo-1564501049412-61c2a3083791", 600) },
];

export const testimonials = [
  { name: "Bilal Ahmed", role: "Frequent traveller", text: "I used to call five hotels to check if a room was free. Now I see it on the page and book right away." },
  { name: "Noor Fatima", role: "Owns a guest house in Hunza", text: "I listed my guest house in an evening. The dashboard shows every booking, so nothing gets missed." },
  { name: "Usman Tariq", role: "Business traveller", text: "Clear prices and free cancellation on most places. No surprises at checkout." },
];

export const formatPKR = (n) => "Rs " + Number(n || 0).toLocaleString("en-PK");

export const fmtDay = (iso) =>
  iso ? new Date(String(iso).slice(0, 10) + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
