const PDFDocument = require("pdfkit");
const streamBuffers = require("stream-buffers");
const QRCode = require("qrcode");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendBookingTicketEmail(booking) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: 40 });
            const bufferStream = new streamBuffers.WritableStreamBuffer();
            doc.pipe(bufferStream);

            // 🔵 Header Banner
            doc.rect(0, 0, 595, 60).fill("#2b6cb0");
            doc.fillColor("#ffffff")
                .fontSize(20)
                .text("Rapid Physio - Appointment Ticket", 0, 20, { align: "center" });

            // Logo
            try {
                const logoPath = "assets/logo.png";
                doc.image(logoPath, 20, 10, { width: 40, height: 40 });
            } catch (err) {
                console.log("⚠ Logo not found, skipping...");
            }

            // Watermark
            doc.rotate(-30, { origin: [297.5, 421] });
            doc.opacity(0.05)
                .fontSize(80)
                .fillColor("#000000")
                .text("Rapid Physio", 50, 250, { align: "center", width: 495 });
            doc.opacity(1).rotate(30, { origin: [297.5, 421] });

            // Ticket Box
            doc.rect(50, 80, 495, 450).stroke("#2b6cb0").lineWidth(1.5);

            // Ticket Details
            let y = 100;
            const addDetail = (label, value) => {
                doc.font("Helvetica-Bold").fontSize(12).fillColor("#000000").text(`${label}:`, 60, y);
                doc.font("Helvetica").text(value || "-", 160, y);
                y += 20;
            };

            addDetail("Booking Ref", booking.bookingRef || "N/A");  // ✅ professional booking ref
            addDetail("Name", booking.name);
            addDetail("Email", booking.email);
            addDetail("Phone", booking.phone);
            addDetail("City", booking.city);
            addDetail("Date", booking.date);
            addDetail("Time", booking.time);
            addDetail("Therapy Type", booking.therapyType);
            addDetail("Therapy Mode", booking.therapyMode);
            addDetail("Payment ID", booking.paymentId);

            // QR Code with bookingRef
            const qrData = JSON.stringify({
                bookingRef: booking.bookingRef,
                name: booking.name,
                date: booking.date,
                time: booking.time,
            });
            const qrImageUrl = await QRCode.toDataURL(qrData);
            doc.image(qrImageUrl, 400, 180, { width: 120, height: 120 });

            // Footer
            doc.fontSize(10).fillColor("#444")
                .text(
                    `Please bring this ticket (digital or printed) to your appointment.\nPDF ticket has also been emailed to ${booking.email}`,
                    50,
                    580,
                    { align: "center", width: 495 }
                );

            doc.end();

            bufferStream.on("finish", async () => {
                const pdfBuffer = bufferStream.getContents();
                if (!pdfBuffer) throw new Error("PDF generation failed");

                // Send PDF via SendGrid
                const msg = {
                    to: booking.email,
                    from: "noreply@rapidphysio.in",
                    subject: "✅ Your Rapid Physio Booking Ticket",
                    html: `
                        <h2>Booking Confirmed</h2>
                        <p>Hi <b>${booking.name}</b>,</p>
                        <p>Your booking is confirmed. Booking Ref: <b>${booking.bookingRef}</b></p>
                        <p>Payment ID: <b>${booking.paymentId}</b></p>
                        <p>Please find your ticket attached as PDF.</p>
                        <p>Thank you for choosing Rapid Physio!</p>
                    `,
                    attachments: [
                        {
                            content: pdfBuffer.toString("base64"),
                            filename: `Booking_Ticket_${booking.bookingRef}.pdf`,
                            type: "application/pdf",
                            disposition: "attachment",
                        },
                    ],
                };

                await sgMail.send(msg);
                resolve();
            });
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = sendBookingTicketEmail;
