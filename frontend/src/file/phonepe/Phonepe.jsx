import React, { useState } from "react";
import "../paypal/paypal.css";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Phonepe = () => {
  const [loading2, setLoading2] = useState(false);
  const location = useLocation();
  const { fullName, email, phone, role } = location.state || {};

  const data = {
    name: fullName,
    email: email,
    amount: 1,
    number: phone,
    role: role,
    MUID: "MUID" + Date.now(),
    transactionId: "T" + Date.now(),
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading2(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment`,
        data
      );

      // 🔥 IMPORTANT LINE
      window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
      setLoading2(false);
    }
  };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-900 mb-3">
            Complete Your Payment
          </h1>
          <p className="text-center text-sm md:text-xl text-gray-500 mb-10">
            Secure one-time access to the program
          </p>

          <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition duration-300">
            {/* Highlight Badge */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-4 py-1 rounded-full shadow">
              Most Popular
            </span>

            <div className="card px-5 py-4 mt-5">
              <form onSubmit={handlePayment}>
                <div className="text-center mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">
                    ₹{data.amount}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    One-time secure payment
                  </p>
                </div>
                {!loading2 ? (
                  <div className="col-12 center">
                    <button
                      className="w-full bg-red-300 hover:bg-red-200 text-white py-3 md:py-4 rounded-2xl text-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl"
                      type="submit"
                    >
                      Pay Now
                    </button>
                  </div>
                ) : (
                  <div className="col-12 center">
                    <button
                      className="w-full bg-red-400 text-white py-3 md:py-4 rounded-2xl text-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl"
                      type="submit"
                    >
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden ">Wait...</span>
                      </div>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Phonepe;
