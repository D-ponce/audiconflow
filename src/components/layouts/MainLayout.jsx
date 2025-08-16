import React from "react";
import { Outlet } from "react-router-dom";
import Header from "components/ui/Header";

export default function MainLayout() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto w-full px-4 py-4">
        <Outlet />
      </main>
    </>
  );
}

