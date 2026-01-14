'use client';

import ScreenshotSlider from "@/components/games-page/screenshot-slider";

interface Props {
  screenshots: string[];
  gameName: string;
}

export default function GameScreenshots({ screenshots, gameName }: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Screenshots</h2>
      <div className="max-w-[700px] lg:max-w-[900px] mx-auto md:mx-0">
        <ScreenshotSlider screenshots={screenshots} gameName={gameName} />
      </div>
    </div>
  );
}
