import Image from "next/image";
import Link from "next/link";
import logo from "../public/media/image/logo_homecyclhome_grayscale.png";
import HeaderNav from "@/components/HeaderNav";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 max-w-6xl mx-auto sm:px-6 lg:px-8 w-full">
      <Link href="/">
        <Image
          src={logo}
          alt="Logo HomeCyclHome"
          width={256}
        />
      </Link>
      <HeaderNav />
    </header>
  );
}
