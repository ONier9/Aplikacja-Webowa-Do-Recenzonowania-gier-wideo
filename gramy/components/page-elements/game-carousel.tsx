"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import Link from "next/link";
import { GameCover } from "@/components/page-elements/game-cover";
import type { SimpleGame } from "./game-grid";

interface GameCarouselProps {
  games: SimpleGame[];
}

export default function GameCarousel({ games }: GameCarouselProps) {
  if (!games || games.length === 0) return null;

  return (
    <div className="w-screen px-0 mx-0 overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={7}
        loop={true}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        speed={4000}
        allowTouchMove={false}
        grabCursor={false}
        breakpoints={{
          1280: { slidesPerView: 6 },
          1024: { slidesPerView: 5 },
          768: { slidesPerView: 4 },
          640: { slidesPerView: 3 },
          0: { slidesPerView: 2 },
        }}
      >
        {games.map((game) => (
          <SwiperSlide key={game.igdb_id}>
            <Link href={`/game/${game.igdb_id}`} className="block">
              <div className="max-w-[180px] mx-auto">
                <GameCover coverUrl={game.cover_url} name={game.name} />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
