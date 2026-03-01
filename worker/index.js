export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Allow CORS for your frontend
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        };

        if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

        // --- ROUTE: CREATE ORDER ---
        if (url.pathname === "/create-order" && request.method === "POST") {
            const { gridConfig } = await request.json();

            const auth = btoa(`${env.RAZORPAY_TEST_KEY_ID}:${env.RAZORPAY_TEST_KEY_SECRET}`);

            const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${auth}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: 9900, // ₹99.00 (Amount in paise)
                    currency: "INR",
                    receipt: `receipt_${Date.now()}`,
                    notes: {
                        // We lock the user's config into the order itself
                        config: JSON.stringify(gridConfig)
                    }
                }),
            });

            const order = await razorpayResponse.json();
            return new Response(JSON.stringify(order), { headers: corsHeaders });
        }

        // --- ROUTE: VERIFY PAYMENT ---
        if (url.pathname === "/verify-payment" && request.method === "POST") {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

            // Verification logic: HMAC SHA256(order_id + "|" + payment_id, secret)
            const data = razorpay_order_id + "|" + razorpay_payment_id;
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw", encoder.encode(env.RAZORPAY_KEY_SECRET),
                { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
            );
            const signatureArrayBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
            const generatedSignature = Array.from(new Uint8Array(signatureArrayBuffer))
                .map(b => b.toString(16).padStart(2, "0")).join("");

            if (generatedSignature === razorpay_signature) {
                // PAYMENT SUCCESSFUL!
                // Now call your Flask backend to generate the final URL
                const finalUrl = `https://your-flask-app.com/generate?order=${razorpay_order_id}`;

                return new Response(JSON.stringify({
                    success: true,
                    url: finalUrl,
                    instructions: "Download your wallpaper using the link above."
                }), { headers: corsHeaders });
            }

            return new Response(JSON.stringify({ success: false }), { status: 400, headers: corsHeaders });
        }

        return new Response("Not Found 2", { status: 404 });
    }
};