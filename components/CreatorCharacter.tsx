import Image from "next/image";
import { site } from "@/data/site";

export function CreatorCharacter() {
  return (
    <Image
      src={site.character.src}
      alt={site.character.alt}
      width={320}
      height={380}
      className="creator-character"
      unoptimized
      preload
    />
  );
}
