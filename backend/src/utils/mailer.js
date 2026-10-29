import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const { smtp } = env;
const enabled = Boolean(smtp.host && smtp.user && smtp.pass && smtp.fromEmail);

const transporter = enabled
  ? nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    })
  : null;

if (!enabled) console.warn("Email is not configured (SMTP_* in .env); booking emails will be skipped.");

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const day = (d) => new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const pkr = (n) => `Rs ${Number(n).toLocaleString("en-PK")}`;

// never throws: a mail problem must not fail a booking that is already saved
async function send(to, subject, html, text) {
  if (!transporter) return;
  try {
    await transporter.sendMail({ from: `"${smtp.fromName}" <${smtp.fromEmail}>`, to, subject, html, text });
  } catch (err) {
    console.error(`Email to ${to} failed:`, err.message);
  }
}

function layout(title, rows, note) {
  const tr = rows
    .map(([k, v]) => `<tr><td style="padding:8px 0;color:#5f6b7a;font-size:14px">${esc(k)}</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px">${esc(v)}</td></tr>`)
    .join("");
  return `<div style="background:#f4f6f9;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#101828">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e3e7ed;border-radius:12px;overflow:hidden">
    <div style="background:#0f1b2d;padding:18px 24px;font-size:22px;font-weight:700;color:#fff">stay<span style="color:#f5a524">field</span></div>
    <div style="padding:24px">
      <h1 style="font-size:20px;margin:0 0 16px">${esc(title)}</h1>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #e3e7ed">${tr}</table>
      <p style="font-size:14px;color:#5f6b7a;margin:20px 0 0">${esc(note)}</p>
    </div>
  </div></div>`;
}

const rowsFor = ({ booking, hotel }) => [
  ["Property", hotel.name],
  ["Location", `${hotel.area ? hotel.area + ", " : ""}${hotel.city}`],
  ["Room", booking.roomType],
  ["Check-in", day(booking.checkIn)],
  ["Check-out", day(booking.checkOut)],
  ["Nights", String(booking.nights)],
  ["Guests", String(booking.guests)],
  ["Total", pkr(booking.total)],
  ["Booking ref", String(booking._id).slice(-8).toUpperCase()],
];

export function sendBookingEmails({ booking, hotel, guest, owner }) {
  const rows = rowsFor({ booking, hotel });
  const plain = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  const jobs = [
    send(
      guest.email,
      `Booking received: ${hotel.name}`,
      layout(`Thanks ${guest.name.split(" ")[0]}, your booking is received`, rows, "The host will confirm it shortly. You can track or cancel it from My trips."),
      `Your booking is received.\n\n${plain}`
    ),
  ];
  if (owner?.email) {
    jobs.push(
      send(
        owner.email,
        `New booking for ${hotel.name}`,
        layout("You have a new booking", [["Guest", `${guest.name} (${guest.email})`], ...rows], "Open your dashboard to confirm or decline it."),
        `New booking from ${guest.name} (${guest.email}).\n\n${plain}`
      )
    );
  }
  return Promise.all(jobs);
}

export function sendStatusEmail({ booking, hotel, guest }) {
  const confirmed = booking.status === "confirmed";
  return send(
    guest.email,
    `${confirmed ? "Booking confirmed" : "Booking cancelled"}: ${hotel.name}`,
    layout(confirmed ? "Your booking is confirmed" : "Your booking was cancelled", rowsFor({ booking, hotel }), confirmed ? "We look forward to hosting you." : "If this was unexpected, please contact the property."),
    `Your booking at ${hotel.name} is ${booking.status}.`
  );
}
