import AppWalletProvider from "@/component/AppWalletProvider";
import Main from "@/component/main/main";
import '@solana/wallet-adapter-react-ui/styles.css';

export default function Home({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppWalletProvider>
        <Main />
        {children}
      </AppWalletProvider>
    </>
  );
}
