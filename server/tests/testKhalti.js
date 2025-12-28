import KhaltiService from "../services/khaltiService.js";
import { generatePaymentInformation } from "../utils/paymentUtils.js";
import { config } from "dotenv";

async function testKhalti() {
  config();
  const khaltiService = new KhaltiService();
  const paymentInformation = generatePaymentInformation({
    user: {
      name: "Aashutosh P",
      email: "pudasainiashutosh@gmail.com",
    },
    show: {
      movie: {
        title: "The Batman",
      },
    },
    booking: {
      bookedSeats: [
        {
          location: 21,
        },
        {
          location: 21,
        },
      ],
      amount: "1000",
      _id: "21bsadas12",
    },
  });
  const res = await khaltiService.initiatePayment(paymentInformation);
  console.log(res);
}

testKhalti().then((t) => console.log(t));
//   .error((e) => console.log(e));
