"use client";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = [
    {
      question: "Πώς συλλέγουμε τα προσωπικά σας δεδομένα;",
      answer: "Συλλέγουμε πληροφορίες μέσω της επικοινωνίας σας μαζί μας, όπως όνομα, email, αριθμό τηλεφώνου και διεύθυνση."
    },
    {
      question: "Πώς προστατεύονται τα δεδομένα μου;",
      answer: "Χρησιμοποιούμε τεχνολογίες κρυπτογράφησης και αποθηκεύουμε τα δεδομένα σας σε ασφαλείς διακομιστές."
    },
    {
      question: "Υπάρχουν εγγυήσεις στα προϊόντα;",
      answer: "Παρέχουμε εγγύηση ανταλλακτικών μόνο για προϊόντα που αγοράστηκαν από εμάς. Δεν καλύπτονται προβλήματα από κακή χρήση."
    },
    {
      question: "Μπορώ να ακυρώσω μια κράτηση;",
      answer: "Ναι, μπορείτε να ακυρώσετε την κράτηση τηλεφωνικά, έως 24 ώρες πριν από το ραντεβού. Μετά από αυτή την περίοδο, ενδέχεται να ισχύουν χρεώσεις."
    },
    {
      question: "Χρησιμοποιείτε cookies;",
      answer: "Ναι, χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας και να παρέχουμε εξατομικευμένες υπηρεσίες."
    },
    {
      question: "Πώς μπορώ να αλλάξω τα προσωπικά μου στοιχεία;",
      answer: "Μπορείτε να επικοινωνήσετε με την υποστήριξη πελατών μας για να ζητήσετε την ενημέρωση ή τη διόρθωση των στοιχείων σας."
    },
    {
      question: "Πώς μπορώ να ζητήσω τη διαγραφή των δεδομένων μου;",
      answer: "Μπορείτε να υποβάλετε αίτημα διαγραφής μέσω email ή της φόρμας επικοινωνίας μας."
    },
    {
      question: "Τι συμβαίνει αν χάσω το ραντεβού μου;",
      answer: "Εάν δεν παρευρεθείτε στο ραντεβού χωρίς προειδοποίηση, ενδέχεται να ισχύσουν χρεώσεις ή να χάσετε την προκαταβολή σας."
    },
    {
      question: "Μπορώ να αλλάξω την ημερομηνία της κράτησής μου;",
      answer: "Ναι, μπορείτε να αλλάξετε την ημερομηνία της κράτησης σας έως 24 ώρες πριν από το προγραμματισμένο ραντεβού, επικοινωνώντας τηλεφωνικά μαζί μας."
    },
    {
      question: "Πόσος χρόνος χρειάζεται για την επεξεργασία της παραγγελίας μου;",
      answer: "Η επεξεργασία της παραγγελίας συνήθως διαρκεί 1-3 εργάσιμες ημέρες, ανάλογα με τη διαθεσιμότητα."
    }
  ];
  

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col min-h-[100dvh] overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-100">
        <Navbar/>
      <main className="flex-grow w-[80%] mx-auto px-4 py-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center dark:text-white text-gray-600">
          Συχνές Ερωτήσεις (FAQ)
        </h1>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold dark:text-white text-gray-600">
                  {faq.question}
                </h2>
                <span className="text-purple-600 dark:text-purple-500 text-2xl">
                  {openIndex === index ? "-" : "+"}
                </span>
              </div>
              {openIndex === index && (
                <p className="mt-4 text-gray-600 dark:text-gray-400">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </main>
      {/* Footer - add slight transparency */}
      <footer className="py-5 flex items-center justify-center gap-8 text-sm text-gray-700 dark:text-gray-400 border-t border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400">Πολιτική Απορρήτου & Όροι Χρήσης</Link>
          <Link href="/faq" className="hover:text-purple-600 dark:hover:text-purple-400">Συχνές Ερωτήσεις</Link>
      </footer>
    </div>
  );
}