"use client";

import React, { useRef } from "react";
import { RainbowKitCustomConnectButton } from "~~/components/helper";
import { useOutsideClick } from "~~/hooks/helper";
import Image from "next/image";

/**
 * Site header
 */
export const Header = () => {
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar min-h-0 shrink-0 justify-between z-30 bg-transparent backdrop-blur-sm px-3">
      <div className="navbar-start flex items-center gap-3">
        <Image src="/logo.svg" alt="Shadow Cipher Clash logo" width={48} height={48} priority className="h-9 w-auto" />
        <span className="text-lg font-semibold text-slate-900 tracking-tight">Private Bet Outcome Simulator</span>
      </div>
      <div className="navbar-end">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
