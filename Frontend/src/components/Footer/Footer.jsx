import { Flex, Link as RLink } from "@radix-ui/themes";
import React from "react";
import { Link } from "react-router-dom";
import backgroundImg from '../../assets/LogoUchoose-white1.png';  

const Footer = () => {
  return (
    <footer className="border-t-2 py-6 px-16 font-[sans-serif] bg-slate-200">
      <div className="flex flex-col lg:flex-row items-center justify-between">
        <Flex align="center">
          <img
            src= {backgroundImg}
            alt="Logo"
            className="mr-4 mb-4 sm:mb-0"
          />
        </Flex>
        <ul className="flex max-sm:flex-col gap-x-6 gap-y-2">
          <li>
            <RLink href="/terms-conditions">Términos y Condiciones</RLink>
          </li>
          <li>
            <strong>uchoose@gmail.com</strong>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;