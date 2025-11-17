"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      <Navbar/>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center dark:text-white text-gray-600">
          Πολιτική Απορρήτου και Όροι Χρήσης
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Privacy Policy Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white text-gray-600">
              Πολιτική Απορρήτου
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                Η πολιτική απορρήτου περιγράφει πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα προσωπικά σας δεδομένα.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-medium dark:text-white text-purple-600">Συλλογή Δεδομένων</h3>
                <p>
                  Συλλέγουμε πληροφορίες όπως όνομα, email, αριθμό τηλεφώνου, διεύθυνση και στοιχεία συσκευής όταν επικοινωνείτε μαζί μας.
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-medium dark:text-white text-purple-600">Προστασία Δεδομένων</h3>
                <p>
                  Τα δεδομένα σας προστατεύονται με κρυπτογράφηση και αποθηκεύονται σε ασφαλείς διακομιστές.
                </p>
              </div>
            </div>
          </section>

          {/* Terms of Use Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white text-gray-600">
              Όροι Χρήσης
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                Οι όροι χρήσης καθορίζουν τους κανόνες και τις προϋποθέσεις για τη χρήση των υπηρεσιών μας.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-medium dark:text-white text-purple-600">Εγγυήσεις</h3>
                <p>
                  Παρέχουμε εγγύηση ανταλλακτικών μόνο για προϊόντα αγορασμένα από εμάς. Η εγγύηση δεν ισχύει για προβλήματα λόγω κακής χρήσης.
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-medium dark:text-white text-purple-600">Ακυρώσεις</h3>
                <p>
                  Μπορείτε να ακυρώσετε μια κράτηση έως 24 ώρες πριν από το ραντεβού. Μετά από αυτή την περίοδο, ενδέχεται να ισχύουν χρεώσεις.
                </p>
              </div>
            </div>
          </section>
        </div>
        
        {/* Document Links Section */}
        <section className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white text-gray-600">
            Σχετικά Έγγραφα
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a 
              href="/documents/ΠροστασίαΔεδομένωνκαιCookies.pdf" 
              target="_blank"
              className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="mr-3 text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="dark:text-white text-gray-600">Προστασία Δεδομένων και Cookies</span>
            </a>


            <a 
              href="/documents/ΠολιτικήΕγγυήσεωνΚΕΠΙΣΤΡΟΦΩΝ.pdf" 
              target="_blank"
              className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="mr-3 text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="dark:text-white text-gray-600">Πολιτική Εγγυήσεων και Επιστροφών</span>
            </a>
            
            <a 
              href="/documents/ΌροιΠαραλαβήςκαιΕπιστροφής.pdf" 
              target="_blank"
              className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="mr-3 text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="dark:text-white text-gray-600">Όροι Παραλαβής και Επιστροφής</span>
            </a>
            
            <a 
              href="/documents/ΌροιΠαράδωσηςΣυσκευής.pdf" 
              target="_blank"
              className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="mr-3 text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="dark:text-white text-gray-600">Όροι Παράδωσης Συσκευής</span>
            </a>
          </div>
        </section>
      </main>
      <footer className="py-5 flex items-center justify-center gap-8 text-sm text-gray-700 dark:text-gray-400 border-t border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400">Πολιτική Απορρήτου & Όροι Χρήσης</Link>
        <Link href="/faq" className="hover:text-purple-600 dark:hover:text-purple-400">Συχνές Ερωτήσεις</Link>
      </footer>
    </div>
  );
}
