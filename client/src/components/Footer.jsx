import React from "react";
import { assets } from "../assets/assets";
const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-36 mt-40  w-full text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
        <div className="md:max-w-96">
          <img alt="" className="h-11" src={assets.logo} />
          <p className="mt-6 text-sm">
            Quick Show — a movie booking system that lets users explore movies,
            view screening times, and reserve seats easily. It features an admin
            panel for adding movies and a smooth connection between the React
            frontend and Express.js backend for fast, reliable performance.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <img src={assets.googlePlay} className="h-9 w-auto" />
            <img src={assets.appStore} alt="app store" className="h-9 w-auto" />
          </div>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2 className="font-semibold mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About us</a>
              </li>
              <li>
                <a href="#">Contact us</a>
              </li>
              <li>
                <a href="#">Privacy policy</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>1234567890</p>
              <p>quickshow@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-4 text-center text-sm pb-5">
        Copyright {new Date().getFullYear()} ©{" "}
        <a href="https://prebuiltui.com">Phenalin</a>. All Right Reserved.
      </p>
    </footer>
  );
};
export default Footer;
