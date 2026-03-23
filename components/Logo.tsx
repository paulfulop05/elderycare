import Image from "next/image";
import logoImg from "@/assets/logo.png";

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo = ({ size = 32, className = "" }: LogoProps) => (
  <Image
    src={logoImg}
    alt="ElderyCare"
    width={size}
    height={size}
    className={className}
    style={{ objectFit: "contain" }}
  />
);

export default Logo;
