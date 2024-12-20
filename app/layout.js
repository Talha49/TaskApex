import { Lora } from 'next/font/google';import "./globals.css";
import SIdebar from "./_components/SideBar/SIdebar";
import ClientProvider from "./_components/ClientProvider/ClientProvider";
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from './_components/ThemeProvider/ThemeProvider';
import SessionWrapper from '@/Sessionwrapper';

const lora = Lora({ subsets: ["latin"] });

export const metadata = {
  title: "TM Manager",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
     
     
      
      <body className={lora.className}>

<SessionWrapper>
<ThemeProvider
attribute="class"
defaultTheme="system"
enableSystem
disableTransitionOnChange
>

  <ClientProvider>
  <ToastProvider>
      <div className="flex h-screen  p-4">
      <div className="flex gap-x-4 dark:bg-neutral-900 bg-neutral-100  rounded-3xl overflow-hidden w-full">
        <SIdebar />
        <main className="flex-1 p-6  rounded-r-3xl border overflow-auto light:bg- transition duration-300  ">
         
          {children} 

         
        
        </main>
      </div>
    </div>
    </ToastProvider>
    </ClientProvider>
    </ThemeProvider>
    </SessionWrapper>
        </body>
    </html>
  );
}
