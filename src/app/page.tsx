import Link from "next/link";
import Navbar from "@/components/Navbar";
import { SwipeCarousel } from "@/components/Hero/page";



export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh] overflow-hidden bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <Navbar />
 
        <main className="flex-1 overflow-hidden">
          <SwipeCarousel />
        </main>

        {/* Footer - add slight transparency */}
        <footer className="flex items-center justify-center gap-8 text-sm text-gray-700 dark:text-gray-400 border-t border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400">Πολιτική Απορρήτου & Όροι Χρήσης</Link>
          <Link href="/faq" className="hover:text-purple-600 dark:hover:text-purple-400">Συχνές Ερωτήσεις</Link>
        </footer>
      </div>
    
  );
}
