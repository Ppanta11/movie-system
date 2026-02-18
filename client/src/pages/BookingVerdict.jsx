import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const BookingVerdict = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("Verifying payment...");

    useEffect(() => {
        const verifyPayment = async () => {
            const queryParams = new URLSearchParams(location.search);
            const pidx = queryParams.get('pidx');
            const status = queryParams.get('status'); 
            const purchase_order_id = queryParams.get('purchase_order_id');

            if (!pidx) {
                setLoading(false);
                setMessage("Invalid payment data.");
                return;
            }

            try {
                const response = await fetch('/api/booking/verify-khalti', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ pidx, purchase_order_id })
                });

                const data = await response.json();

                if (data.success) {
                    if (data.data.status === 'Completed') {
                        toast.success("Payment Successful!");
                        setMessage("Payment Successful! Redirecting...");
                        setTimeout(() => navigate('/my-bookings'), 2000);
                    } else {
                        toast.error("Payment not completed.");
                        setMessage(`Payment Status: ${data.data.status}`);
                    }
                } else {
                    toast.error(data.message || "Verification failed");
                    setMessage("Verification failed.");
                }

            } catch (error) {
                console.error("Verification error:", error);
                setMessage("An error occurred during verification.");
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location.search, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold mb-4">Payment Verification</h2>
                {loading ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
                ) : (
                    <p className="text-lg">{message}</p>
                )}
            </div>
        </div>
    );
};

export default BookingVerdict;
