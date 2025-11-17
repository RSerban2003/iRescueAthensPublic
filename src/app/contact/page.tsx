"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { FaPhone, FaEnvelope, FaInstagram, FaFacebook, FaTiktok, FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [ formData, setFormData ] = useState<ContactForm>( {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  } );

  const [ isSubmitting, setIsSubmitting ] = useState( false );
  const [ submitStatus, setSubmitStatus ] = useState<'success' | 'error' | null>( null );

  const handleSubmit = async ( e: React.FormEvent ) => {
    e.preventDefault();
    setIsSubmitting( true );

    try {
      // Send form data to our API endpoint
      const response = await fetch( '/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( formData ),
      } );

      if ( !response.ok ) {
        const errorData = await response.json();
        throw new Error( errorData.error || 'Failed to send message' );
      }

      setSubmitStatus( 'success' );
      setFormData( { name: "", email: "", phone: "", subject: "", message: "" } );
    } catch ( error ) {
      console.error( 'Error submitting contact form:', error );
      setSubmitStatus( 'error' );
    } finally {
      setIsSubmitting( false );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-600 dark:text-white">Επικοινωνία</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Χρειάζεστε βοήθεια; Είμαστε εδώ για εσάς! Επικοινωνήστε μαζί μας τώρα.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-600 dark:text-white">Στείλτε μας μήνυμα</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-white">Ονοματεπώνυμο</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={( e ) => setFormData( { ...formData, name: e.target.value } )}
                    className="w-full p-3 rounded-lg border dark:bg-gray-700 text-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-white">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={( e ) => setFormData( { ...formData, email: e.target.value } )}
                    className="w-full p-3 rounded-lg border dark:bg-gray-700 text-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-white">Τηλέφωνο</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={( e ) => setFormData( { ...formData, phone: e.target.value } )}
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 text-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-white">Θέμα</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={( e ) => setFormData( { ...formData, subject: e.target.value } )}
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 text-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-white">Μήνυμα</label>
                <textarea
                  value={formData.message}
                  onChange={( e ) => setFormData( { ...formData, message: e.target.value } )}
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 text-gray-600 dark:text-white"
                  rows={5}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg transition-colors ${isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                  } text-white`}
              >
                {isSubmitting ? "Αποστολή..." : "Αποστολή Μηνύματος"}
              </button>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                  Το μήνυμά σας στάλθηκε! Θα σας απαντήσουμε σύντομα.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                  Κάτι πήγε στραβά. Δοκιμάστε ξανά!
                </div>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-600 dark:text-white">Γρήγορη Επικοινωνία</h2>
              <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-0">
                  <FaPhone className="text-purple-600 text-lg sm:text-xl mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-600 text-sm sm:text-base">Τηλέφωνο</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">+30 697 455 8380</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-0">
                  <FaWhatsapp className="text-purple-600 text-lg sm:text-xl mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-600 text-sm sm:text-base">WhatsApp</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">+30 697 455 8380</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-0">
                  <FaEnvelope className="text-purple-600 text-lg sm:text-xl mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-600 text-sm sm:text-base">Email</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">contact@irescueathens.com
                    </p>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-0">
                  <FaInstagram className="text-purple-600 text-lg sm:text-xl mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-600 text-sm sm:text-base">Instagram</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">irescue.athens</p>
                  </div>
                </div>

                {/* Facebook */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-0">
                  <FaFacebook className="text-purple-600 text-lg sm:text-xl mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-600 text-sm sm:text-base">Facebook</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">IRescue Athens</p>
                  </div>
                </div>

                {/* TikTok */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-0">
                  <FaTiktok className="text-purple-600 text-lg sm:text-xl mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-600 text-sm sm:text-base">TikTok</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">irescueathens</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Service Information */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-6 text-gray-600 dark:text-white">Πώς Λειτουργούμε</h2>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-md text-left">
                  🚚 <strong>Δωρεάν μεταφορικά:</strong> Παραλαβή και Παράδοση της συσκευής σας Χωρίς Χρέωση.  <br />
                  🔧 <strong>Γρήγορη επισκευή:</strong> Άμεση Επισκευή ή Αγορά της συσκευής σας.  <br />
                  📦 <strong>Δωρεάν επιστροφή:</strong> Σας την επιστρέφουμε άμεσα και χωρίς κόστος.
                  <br />
                  <strong className="text-lg text-purple-600">Απλά και Γρήγορα στην πόρτα σου!</strong>
                </p>
              </div>
            </div>
          </div>
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