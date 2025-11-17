"use client";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function AboutPage() {
  const services = [
    {
      title: "Δωρεάν Εκτίμηση & Μεταφορικά",
      description: "Στέλνεις τη συσκευή σου δωρεάν, την ελέγχουμε και σου δίνουμε προσφορά χωρίς καμία δέσμευση!",
      icon: "🚚"
    },
    {
      title: "Άμεση Επισκευή",
      description: "Επισκευάζουμε γρήγορα και αξιόπιστα, με τις περισσότερες επισκεύες να ολοκληρώνονται σε 48 ώρες!",
      icon: "⚡"
    },
    {
      title: "Εγγύηση Αξιοπιστίας",
      description: "Όλες οι επισκευές μας καλύπτονται από 90 ημέρες εγγύηση!",
      icon: "🛡️"
    },
    {
      title: "Ανταγωνιστικές Τιμές",
      description: "Προσιτές τιμές χωρίς κρυφές χρεώσεις και με διαφάνεια!",
      icon: "💰"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Επισκεύασε, Πούλησε ή Αγόρασε <br/>Μεταχειρισμένη Συσκευή <span className="text-purple-600"> Άμεσα!</span>  
          </h1>
        </div>

        {/* Services Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Γιατί να μας Επιλέξεις;</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="shadow-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-700 dark:text-gray-400"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">{service.title}</h3>
                <p className="text-gray-700 dark:text-gray-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-purple-600 text-white rounded-2xl p-12 shadow-md">
          <h2 className="text-3xl font-bold mb-4">Έτοιμος να Ξεκινήσεις;</h2>
          <p className="mb-8 text-lg text-gray-100">
            Επισκεύασε το κινητό σου ή Δες τις διαθέσιμες μεταχειρισμένες συσκευές μας!
          </p>
          <button className="transition-all duration-300  hover:scale-105 bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            <Link href="/repair">Ζήτησε Δωρεάν Εκτίμηση</Link>
          </button>
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
