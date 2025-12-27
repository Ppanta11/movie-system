function generatePaymentInformation(information) {
  const seatQuantity = information.booking.bookedSeats.length;
  const movieName = information.show.movie.title;
  const amount = information.booking.amount;

  const totalAmount = amount * seatQuantity;
  const purchaseOrderId = information.booking._id;
  const purchaseOrderName = `Tickets for ${movieName} X ${seatQuantity}`;
  const userName = information.user.name;
  const userEmail = information.user.email;
  const productIdentity = information.booking._id;
  const merchantUsername = "";
  const merchantExtra = "";

  return {
    amount,
    totalAmount,
    purchaseOrderId,
    purchaseOrderName,
    userEmail,
    userName,
    productIdentity,
    merchantUsername,
    merchantExtra,
    seatQuantity,
  };
}

export { generatePaymentInformation };
