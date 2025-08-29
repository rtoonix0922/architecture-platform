"use client";
import { useEffect } from "react";
export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    location.href = token ? "/dashboard" : "/login";
  }, []);
  return null;
}
