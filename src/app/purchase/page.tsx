"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { PaymentSection } from "@/components/PaymentSection";
import Link from "next/link";
import {
  getFirstImageFromString,
  getAllImagesFromString,
} from "@/lib/imageUtils";
import "@/components/Calendar.css"; // Import Calendar styles
// Import icons
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaMemory,
  FaMobileAlt,
  FaPaintBrush,
} from "react-icons/fa";

interface PhoneProduct {
  id: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
  storage: string;
  color: string;
  images: string; // This will be parsed
  year?: number;
  description?: string;
  status?: string;
}

// Define the booking data type to match PaymentSection
interface BookingData {
  date: Date | null;
  timeSlot: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  };
  paymentMethod: "online" | "instore";
}

export default function PurchasePage() {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<PhoneProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phones, setPhones] = useState<PhoneProduct[]>([]);
  const [filters, setFilters] = useState({
    brand: "all",
    priceRange: [0, 2000],
    condition: "all",
    storage: "all",
    sort: "newest",
  });

  // State for the detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [phoneImages, setPhoneImages] = useState<string[]>([]);
  const [uniqueBrands, setUniqueBrands] = useState<string[]>([]);

  const adminKey = encodeURIComponent(process.env.NEXT_PUBLIC_ADMIN_KEY!);
  
  // Fetch phones from API
  useEffect(() => {
    async function fetchPhones() {
      try {
        setLoading(true);
        const response = await fetch("/api/phones-for-sale");

        if (!response.ok) {
          throw new Error("Failed to fetch phones");
        }

        const data = await response.json();
        setPhones(data.phones || []);

        // Extract unique brands (case-insensitive)
        const brandsSet = Array.from(
          new Set(
            data.phones.map((phone: PhoneProduct) => 
              phone.brand.toLowerCase().trim()
            )
          )
        ).map(brand => {
          // Find the first occurrence to get the original casing
          const originalBrand = data.phones.find(
            (p: PhoneProduct) => p.brand.toLowerCase().trim() === brand
          )?.brand;
          return originalBrand || brand;
        });
        
        setUniqueBrands(brandsSet);
      } catch (err) {
        console.error("Error fetching phones:", err);
        setError("Failed to load phones. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchPhones();
  }, []);

  const sortedPhones = phones
    .filter((phone) => {
      if (filters.brand !== "all" && phone.brand !== filters.brand)
        return false;
      if (
        phone.price < filters.priceRange[0] ||
        phone.price > filters.priceRange[1]
      )
        return false;
      if (filters.condition !== "all" && phone.condition !== filters.condition)
        return false;
      if (filters.storage !== "all" && phone.storage !== filters.storage)
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return (b.year || 0) - (a.year || 0); // Sort by newest first
        case "priceAsc":
          return a.price - b.price; // Sort by price ascending
        case "priceDesc":
          return b.price - a.price; // Sort by price descending
        default:
          return 0;
      }
    });

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      sort: e.target.value,
    });
  };

  const handlePhoneClick = (phone: PhoneProduct) => {
    setSelectedPhone(phone);
    setPhoneImages(getAllImagesFromString(phone.images));
    setCurrentImageIndex(0);
    setShowDetailModal(true);
  };

  const handleBuyClick = (phone: PhoneProduct) => {
    setSelectedPhone(phone);
    setShowPayment(true);
    setShowDetailModal(false); // Close the modal if open
  };

  // Handle marking the phone as sold after purchase
  const handlePurchaseComplete = async (data: BookingData) => {
    console.log("Η παραγγελία ολοκληρώθηκε:", {
      device: {
        brand: selectedPhone?.brand,
        model: selectedPhone?.model,
      },
      orderDetails: {
        condition: selectedPhone?.condition,
        storage: selectedPhone?.storage,
        price: selectedPhone?.price,
      },
      booking: data,
    });

    if (selectedPhone) {
      try {
        // Update the phone listing status to SOLD
        const response = await fetch(
          `/api/admin/phones-for-sale/${selectedPhone.id}?adminKey=${adminKey}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "SOLD" }),
          }
        );

        if (!response.ok) {
          console.error("Failed to update phone status");
        } else {
          console.log("Phone marked as SOLD");

          // Remove the phone from the displayed list without resetting the UI
          // This will allow the confirmation page to remain visible
          setPhones(phones.filter((phone) => phone.id !== selectedPhone.id));
          
          // Send notification to admin about the purchase
          try {
            const notificationResponse = await fetch('/api/notifications/purchase', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                brand: selectedPhone.brand,
                model: selectedPhone.model,
                price: selectedPhone.price,
                condition: selectedPhone.condition,
                storage: selectedPhone.storage,
                color: selectedPhone.color,
                customerName: data.contactInfo.name,
                customerEmail: data.contactInfo.email,
                customerPhone: data.contactInfo.phone,
                customerAddress: data.contactInfo.address,
                paymentMethod: data.paymentMethod,
                notes: data.contactInfo.notes,
              }),
            });
            
            if (!notificationResponse.ok) {
              console.error('Failed to send admin notification about purchase');
            }
          } catch (notificationError) {
            console.error('Error sending admin notification about purchase:', notificationError);
          }
        }
      } catch (err) {
        console.error("Error updating phone status:", err);
      }

      // Don't reset the UI so the user stays on the confirmation page
      // The user can navigate away manually when they're ready
    }
  };

  const [showFilters, setShowFilters] = useState(false);
  const [viewColumns, setViewColumns] = useState(3);


  // Image carousel navigation functions
  const nextImage = () => {
    if (phoneImages.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === phoneImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (phoneImages.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? phoneImages.length - 1 : prevIndex - 1
      );
    }
  };

  // Function to determine condition label class
  const getConditionClass = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "new":
      case "brand new":
      case "καινούριο":
        return "bg-green-100 text-green-800";
      case "like new":
      case "σαν καινούριο":
        return "bg-teal-100 text-teal-800";
      case "excellent":
      case "άριστο":
        return "bg-blue-100 text-blue-800";
      case "good":
      case "καλό":
        return "bg-yellow-100 text-yellow-800";
      case "fair":
      case "μέτριο":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col overflow-hidden min-h-[100dvh] bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12">
        {!showPayment ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
                Διάλεξε το κινητό που σου ταιριάζει
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Ελεγμένες συσκευές με εγγύηση σε προσιτές τιμές
              </p>
            </div>

            {/* Responsive Filters */}
            <div className="shadow-md bg-white dark:bg-gray-800 p-6 rounded-xl mb-8">
              {/* Small screen buttons */}
              <div className="flex sm:hidden justify-between">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md"
                >
                  Φίλτρα
                </button>
                <button
                  onClick={() =>
                    setViewColumns(
                      viewColumns === 1 ? 2 : viewColumns === 2 ? 3 : 1
                    )
                  }
                  className="py-2"
                >
                  Προβολή{" "}
                  <span className="text-purple-600 font-bold px-1 text-lg">
                    {viewColumns}
                  </span>
                </button>
              </div>

              {/* Filters (hidden on small screens unless expanded) */}
              <div
                className={`grid gap-4 ${
                  showFilters ? "grid-cols-1" : "hidden"
                } sm:grid sm:grid-cols-2 lg:grid-cols-4 mt-4`}
              >
                {/* Brand Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Μάρκα
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) =>
                      setFilters({ ...filters, brand: e.target.value })
                    }
                    className="w-full p-2 rounded border border-gray-600 dark:border-white dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  >
                    <option value="all">Όλες οι Μάρκες</option>
                    {uniqueBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort by Price/Newest */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ταξινόμηση
                  </label>
                  <select
                    value={filters.sort}
                    onChange={handleSortChange}
                    className="w-full p-2 rounded border border-gray-600 dark:border-white dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  >
                    <option value="newest">Νεότερα</option>
                    <option value="priceAsc">Τιμή (Αύξουσα)</option>
                    <option value="priceDesc">Τιμή (Φθίνουσα)</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Εύρος Τιμής
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceRange: [
                            Number(e.target.value),
                            filters.priceRange[1],
                          ],
                        })
                      }
                      className="w-full p-2 rounded border border-gray-600 dark:border-white dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                      έως
                    </span>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceRange: [
                            filters.priceRange[0],
                            Number(e.target.value),
                          ],
                        })
                      }
                      className="w-full p-2 rounded border border-gray-600 dark:border-white dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                </div>

                {/* Reset Filters */}
                <div className="flex items-end justify-between gap-2">
                  <button
                    onClick={() =>
                      setFilters({
                        brand: "all",
                        priceRange: [0, 2000],
                        condition: "all",
                        storage: "all",
                        sort: "newest",
                      })
                    }
                    className="px-4 py-2 text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-700 border rounded-lg border-purple-600"
                  >
                    Επαναφορά Φίλτρων
                  </button>
                  <button
                    onClick={() =>
                      setViewColumns(
                        viewColumns === 1 ? 2 : viewColumns === 2 ? 3 : 1
                      )
                    }
                    className="py-2"
                  >
                    Προβολή{" "}
                    <span className="text-purple-600 font-bold px-1 text-lg">
                      {viewColumns}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading and Error States */}
            {loading && (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Phone Grid */}
            {!loading && !error && (
              <>
                {sortedPhones.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <p className="text-xl">Δεν βρέθηκαν διαθέσιμα κινητά</p>
                    <p className="mt-2">
                      Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης ή ελέγξτε ξανά
                      αργότερα.
                    </p>
                  </div>
                ) : (
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-${Math.min(
                      viewColumns,
                      2
                    )} md:grid-cols-${viewColumns} gap-6`}
                  >
                    {sortedPhones.map((phone) => (
                      <div
                        key={phone.id}
                        className="shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer"
                        onClick={() => handlePhoneClick(phone)}
                      >
                        <div className="relative h-48">
                          <Image
                            src={getFirstImageFromString(phone.images)}
                            alt={`${phone.brand} ${phone.model}`}
                            fill
                            className="object-cover w-full h-full"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={false}
                            quality={75}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/default-phone.jpg";
                            }}
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                            {phone.brand} {phone.model}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 text-xl font-bold mb-2">
                            {phone.price}€
                          </p>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex-grow">
                            <p>Κατάσταση: {phone.condition}</p>
                            <p>Αποθηκευτικός Χώρος: {phone.storage}</p>
                            <p>Χρώμα: {phone.color}</p>
                          </div>
                          <div
                            className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors dark:bg-purple-700 dark:hover:bg-purple-800 text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyClick(phone);
                            }}
                          >
                            Αγορά
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Phone Detail Modal */}
            {showDetailModal && selectedPhone && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
                onClick={() => setShowDetailModal(false)}
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Close Button */}
                  <button
                    className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col md:flex-row">
                    {/* Image Gallery */}
                    <div className="w-full md:w-1/2 p-4 relative">
                      <div className="relative h-64 sm:h-80 md:h-96 mb-4">
                        <Image
                          src={phoneImages[currentImageIndex]}
                          alt={`${selectedPhone.brand} ${selectedPhone.model}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          quality={90}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/default-phone.jpg";
                          }}
                        />

                        {/* Navigation Arrows */}
                        {phoneImages.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FaChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FaChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Thumbnail Gallery */}
                      {phoneImages.length > 1 && (
                        <div className="flex overflow-x-auto gap-2 py-2 pb-4">
                          {phoneImages.map((img, index) => (
                            <div
                              key={index}
                              className={`relative w-16 h-16 flex-shrink-0 cursor-pointer border-2 rounded ${
                                currentImageIndex === index
                                  ? "border-purple-600"
                                  : "border-transparent"
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <Image
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover rounded"
                                sizes="64px"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/default-phone.jpg";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Phone Details */}
                    <div className="w-full md:w-1/2 p-5 pb-6">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        {selectedPhone.brand} {selectedPhone.model}
                      </h2>

                      <div className="flex items-center mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionClass(
                            selectedPhone.condition
                          )}`}
                        >
                          {selectedPhone.condition}
                        </span>
                        {selectedPhone.year && (
                          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                            Έτος: {selectedPhone.year}
                          </span>
                        )}
                      </div>

                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                        {selectedPhone.price}€
                      </p>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center">
                          <FaMobileAlt className="text-purple-600 w-5 h-5 mr-3" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Κατάσταση:</strong>{" "}
                            {selectedPhone.condition}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <FaMemory className="text-purple-600 w-5 h-5 mr-3" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Αποθηκευτικός Χώρος:</strong>{" "}
                            {selectedPhone.storage}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <FaPaintBrush className="text-purple-600 w-5 h-5 mr-3" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Χρώμα:</strong> {selectedPhone.color}
                          </span>
                        </div>
                      </div>

                      {selectedPhone.description && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                            Περιγραφή
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {selectedPhone.description}
                          </p>
                        </div>
                      )}

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => handleBuyClick(selectedPhone)}
                          className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors dark:bg-purple-700 dark:hover:bg-purple-800 text-center"
                        >
                          Αγορά Τώρα
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <PaymentSection
            totalAmount={selectedPhone?.price || 0}
            itemDetails={[
              {
                title: `${selectedPhone?.brand} ${selectedPhone?.model} - purchase`,
                price: selectedPhone?.price || 0,
              },
            ]}
            onComplete={(data) => handlePurchaseComplete(data as BookingData)}
            pageId={3} // Pass pageId === 2 to PaymentSection
          />
        )}
      </main>
      {/* Footer - add slight transparency */}
      <footer className="py-5 flex items-center justify-center gap-8 text-sm text-gray-700 dark:text-gray-400 border-t border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <Link
          href="/privacy"
          className="hover:text-purple-600 dark:hover:text-purple-400"
        >
          Πολιτική Απορρήτου & Όροι Χρήσης
        </Link>
        <Link
          href="/faq"
          className="hover:text-purple-600 dark:hover:text-purple-400"
        >
          Συχνές Ερωτήσεις
        </Link>
      </footer>
    </div>
  );
}
