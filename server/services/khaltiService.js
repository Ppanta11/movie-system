class KhaltiService {
  async initiatePayment(paymentDetails) {
    const body = JSON.stringify({
      return_url: "http://localhost:5173/bookings/verdict",
      website_url: "http://localhost:5173/",
      amount: paymentDetails.totalAmount * 100,
      purchase_order_id: paymentDetails.purchaseOrderId,
      purchase_order_name: paymentDetails.purchaseOrderName,
      customer_info: {
        name: paymentDetails.userName,
        email: paymentDetails.userEmail,
      },
      merchant_username: paymentDetails.merchantUsername,
      merchant_extra: paymentDetails.merchantExtra,
      product_details: [
        {
          identity: paymentDetails.purchaseOrderId,
          name: paymentDetails.purchaseOrderName,
          total_price: paymentDetails.totalAmount * 100,
          quantity: paymentDetails.seatQuantity,
          unit_price: paymentDetails.amount,
        },
      ],
    });

    const khaltiUrl = process.env.KHALTI_CHECKOUT_URL;
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
    const response = await fetch(khaltiUrl, {
      method: "POST",
      body: body,
      headers: {
        Authorization: `key ${khaltiSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const jsonError = await response.json();
      console.log(jsonError);
      throw new Error("error getting checkout url from khalti");
    }
    const jsonData = await response.json();
    return jsonData?.payment_url;
  }
}

export default KhaltiService;
