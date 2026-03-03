export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

    // --- ROUTE: CREATE ORDER ---
    if (url.pathname === "/create-order" && request.method === "POST") {
      try {
        const { gridConfig } = await request.json();
        const auth = btoa(`${env.RAZORPAY_TEST_KEY_ID}:${env.RAZORPAY_TEST_KEY_SECRET}`);

        const razorpayResponse = await fetch(
          "https://api.razorpay.com/v1/orders",
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: 5900, // ₹59.00 in paise
              currency: "INR",
              receipt: `receipt_${Date.now()}`,
              notes: {
                config: JSON.stringify(gridConfig),
              },
            }),
          },
        );

        const order = await razorpayResponse.json();
        if (!razorpayResponse.ok) {
          return new Response(
            JSON.stringify({ error: order.error || "Order creation failed" }),
            {
              status: 502,
              headers: jsonHeaders,
            },
          );
        }
        return new Response(JSON.stringify(order), { headers: jsonHeaders });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Failed to create order" }),
          {
            status: 500,
            headers: jsonHeaders,
          },
        );
      }
    }

    // --- ROUTE: VERIFY PAYMENT ---
    if (url.pathname === "/verify-payment" && request.method === "POST") {
      try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
          await request.json();

        // Verify HMAC SHA-256 signature
        const data = razorpay_order_id + "|" + razorpay_payment_id;
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(env.RAZORPAY_TEST_KEY_SECRET),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const signatureBuffer = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(data),
        );
        const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        if (generatedSignature !== razorpay_signature) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid signature" }),
            {
              status: 400,
              headers: jsonHeaders,
            },
          );
        }

        const auth = btoa(`${env.RAZORPAY_TEST_KEY_ID}:${env.RAZORPAY_TEST_KEY_SECRET}`);

        // Fetch the order from Razorpay to retrieve the locked config
        const orderRes = await fetch(
          `https://api.razorpay.com/v1/orders/${razorpay_order_id}`,
          { headers: { Authorization: `Basic ${auth}` } },
        );
        const order = await orderRes.json();
        const config = JSON.parse(order.notes.config);

        // Fetch payment details from Razorpay to get the payer's phone number
        const paymentRes = await fetch(
          `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
          { headers: { Authorization: `Basic ${auth}` } },
        );
        const paymentDetails = await paymentRes.json();
        const phone = paymentDetails.contact; // e.g. "+919876543210"

        if (!phone) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Phone number not available from payment",
            }),
            { status: 400, headers: jsonHeaders },
          );
        }

        // Save user phone + config to Firestore via backend
        const backendUrl = env.BACKEND_URL || "http://127.0.0.1:5001";
        try {
          await fetch(`${backendUrl}/api/save-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone,
              config,
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
            }),
          });
        } catch (saveErr) {
          // Log but don't block the user – the URL will still work via
          // query params if Firestore save fails
          console.error("Failed to save user to Firestore:", saveErr);
        }

        // Build wallpaper URL with only the phone number
        const params = new URLSearchParams();
        params.set("phno", phone);
        const wallpaperUrl = `${backendUrl}/wallpaper?${params.toString()}`;

        return new Response(
          JSON.stringify({
            success: true,
            wallpaperUrl,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
          }),
          { headers: jsonHeaders },
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: "Verification failed" }),
          {
            status: 500,
            headers: jsonHeaders,
          },
        );
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
