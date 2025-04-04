import Main_Index from "./components/main";
import "./globals.css";

export default function Home({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <>
        <Main_Index />
        {children}
    </>
  );
}
