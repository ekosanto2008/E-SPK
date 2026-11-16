"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const vectorImages = [
  {
    id: 1,
    src: "/images/vector/LOGIN VECTOR.jpg",
    alt: "Vektor Halaman Login 1",
  },
  {
    id: 2,
    src: "/images/vector/LOGIN VECTOR 2.jpg",
    alt: "Vektor Halaman Login 2",
  },
  {
    id: 3,
    src: "/images/vector/LOGIN VECTOR 3.jpg",
    alt: "Vektor Halaman Login 3",
  },
];

export default function AuthVectorCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % vectorImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + vectorImages.length) % vectorImages.length
    );
  }, []);

  // Auto-slide setiap 4.5 detik (pause saat mouse hover)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Touch swipe support untuk perangkat sentuh
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="group relative flex h-full w-full flex-col items-center justify-center p-4 lg:p-8 select-none bg-transparent"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Area Gambar Utama - Full Image Bebas Leluasa */}
      <div className="relative w-full h-[70vh] max-h-[750px] max-w-[680px] flex items-center justify-center">
        {vectorImages.map((img, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={img.id}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                isActive
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  style={{ mixBlendMode: "multiply" }}
                  priority={idx === 0}
                />
              </div>
            </div>
          );
        })}

        {/* Tombol Navigasi Prev (Panah Kiri) */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Slide sebelumnya"
          className="absolute start-2 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-700 dark:text-gray-200 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        >
          <ChevronLeftIcon className="size-5" />
        </button>

        {/* Tombol Navigasi Next (Panah Kanan) */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Slide selanjutnya"
          className="absolute end-2 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-700 dark:text-gray-200 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>

      {/* Dots Indicator Minimalis Tanpa Teks Apapun */}
      <div className="relative z-10 mt-4 flex items-center justify-center gap-2">
        {vectorImages.map((img, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                isActive
                  ? "w-8 bg-brand-500"
                  : "w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
