"use client";
import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { PaymentSection } from "@/components/PaymentSection";
import Link from "next/link";
import toast from "react-hot-toast";

// Phone brands and models (reusing from repair page)
const phoneOptions = {
  Apple: [
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16 Plus",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 15 Plus",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14",
    "iPhone 14 Plus",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 13 mini",
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    "iPhone 12",
    "iPhone 12 mini",
    "iPhone 11 Pro Max",
    "iPhone 11 Pro",
    "iPhone 11",
    "iPhone SE (2022)",
    "iPhone SE (2020)",
  ],
  Samsung: [
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23+",
    "Galaxy S23",
    "Galaxy S22 Ultra",
    "Galaxy S22+",
    "Galaxy S22",
    "Galaxy S21 Ultra",
    "Galaxy S21+",
    "Galaxy S21",
    "Galaxy Z Fold 5",
    "Galaxy Z Flip 5",
    "Galaxy Z Fold 4",
    "Galaxy Z Flip 4",
    "Galaxy A54",
    "Galaxy A34",
    "Galaxy A14",
    "Galaxy M54",
    "Galaxy M34",
  ],
  Google: [
    "Pixel 8 Pro",
    "Pixel 8",
    "Pixel 7 Pro",
    "Pixel 7",
    "Pixel 6 Pro",
    "Pixel 6",
    "Pixel 5",
    "Pixel 4a",
    "Pixel 4 XL",
    "Pixel 4",
  ],
  OnePlus: [
    "11 5G",
    "10 Pro",
    "10T",
    "Nord 3",
    "Nord CE 3",
    "Nord N30",
    "Nord N20",
  ],
  Αλλο : [
    
  ]
};

// Storage options
const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];

// Condition options
const conditionOptions = [
  { value: "Excellent", label: "Άριστη", description: "Σαν καινούριο, χωρίς γρατζουνιές" },
  { value: "VeryGood", label: "Πολύ Καλή", description: "Ελάχιστα σημάδια χρήσης" },
  { value: "Good", label: "Καλή", description: "Εμφανή σημάδια χρήσης" },
  { value: "Fair", label: "Μέτρια", description: "Σημαντικές φθορές" },
];

// Step titles and descriptions
const stepTitles: Record<number, string> = {
  1: "Ποιο κινητό θέλετε να πουλήσετε;",
  2: "Επιλέξτε το Μοντέλο σας",
  3: "Λεπτομέρειες Συσκευής",
  4: "Ολοκληρώστε την Αγγελία",
  5: "Επιτυχής Υποβολή",
};

const stepDescriptions: Record<number, string> = {
  1: "Επιλέξτε την εταιρία του κινητού σας για να ξεκινήσετε",
  2: "Επιλέξτε το μοντέλο του κινητού σας",
  3: "Συμπληρώστε τις λεπτομέρειες της συσκευής σας",
  4: "Συμπληρώστε τα στοιχεία σας για να ολοκληρώσετε την αγγελία",
  5: "Η παραγγελία σας υποβλήθηκε με επιτυχία",
};

// Define the BookingData interface to match the one in PaymentSection
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
  paymentMethod: 'online' | 'instore';
}

const SellPhonePage: React.FC = () => {
  
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingId, setListingId] = useState<string>("");
  
  // State for phone details
  const [phoneDetails, setPhoneDetails] = useState({
    brand: "",
    model: "",
    price: 0,
    condition: "",
    storage: "",
    description: "",
    images: [] as File[],
  });

  // Estimated price based on selections
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);

  // Handle brand selection
  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setPhoneDetails({ ...phoneDetails, brand });
    setStep(2);
  };

  // Handle model selection
  const handleModelSelect = (model: string) => {
    setPhoneDetails({ ...phoneDetails, model });
    setStep(3);
    
    // Set an estimated price based on brand and model
    let basePrice = 0;
    
    // Determine base price by brand and model features with lower starting values
    if (selectedBrand === "Apple") {
      basePrice = model.includes("Pro Max") ? 380 : 
                 model.includes("Pro") ? 340 : 
                 model.includes("Plus") || model.includes("+") ? 300 :
                 model.includes("Max") ? 320 : 
                 model.includes("mini") ? 220 : 280;
                 
      // Newer models are worth more
      if (model.includes("16")) basePrice += 100;
      else if (model.includes("15")) basePrice += 80;
      else if (model.includes("14")) basePrice += 60;
      else if (model.includes("13")) basePrice += 40;
      else if (model.includes("12")) basePrice += 20;
      
      // SE models are cheaper
      if (model.includes("SE")) basePrice = 150;
    } 
    else if (selectedBrand === "Samsung") {
      basePrice = model.includes("Ultra") ? 350 : 
                 model.includes("+") ? 300 : 
                 model.includes("Fold") ? 400 :
                 model.includes("Flip") ? 320 : 
                 model.startsWith("Galaxy S") ? 250 :
                 model.startsWith("Galaxy A") ? 150 : 100;
                 
      // Newer models are worth more
      if (model.includes("24")) basePrice += 100;
      else if (model.includes("23")) basePrice += 80;
      else if (model.includes("22")) basePrice += 60;
      else if (model.includes("21")) basePrice += 40;
      
      // Z Fold/Flip models are premium
      if (model.includes("Z Fold 5") || model.includes("Z Flip 5")) basePrice += 50;
    }
    else if (selectedBrand === "Google") {
      basePrice = model.includes("Pro") ? 280 : 220;
      
      // Newer models are worth more
      if (model.includes("8")) basePrice += 80;
      else if (model.includes("7")) basePrice += 60;
      else if (model.includes("6")) basePrice += 30;
    }
    else if (selectedBrand === "OnePlus") {
      basePrice = model.startsWith("11") ? 250 :
                 model.startsWith("10") ? 200 :
                 model.includes("Nord") ? 120 : 150;
    }
    else {
      // Generic base price for other brands
      basePrice = 120;
    }
    
    // Ensure the price is within the 50-600 range
    basePrice = Math.min(Math.max(basePrice, 50), 600);
    
    setEstimatedPrice(basePrice);
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Update estimated price based on condition and storage
    let priceAdjustment = estimatedPrice;
    
    if (name === "condition") {
      const conditionMultipliers: Record<string, number> = {
        "Excellent": 1,
        "VeryGood": 0.8,
        "Good": 0.65,
        "Fair": 0.45
      };
      priceAdjustment = Math.round(estimatedPrice * (conditionMultipliers[value] || 1));
    }
    
    if (name === "storage") {
      // First, remove any existing storage adjustment
      const previousStorage = phoneDetails.storage;
      
      // Storage price adjustments based on brand - more moderate adjustments
      const getStorageValue = (storage: string, brand: string) => {
        const isApple = brand === "Apple";
        switch(storage) {
          case "64GB": return 0;
          case "128GB": return isApple ? 30 : 20;
          case "256GB": return isApple ? 60 : 40;
          case "512GB": return isApple ? 90 : 60;
          case "1TB": return isApple ? 120 : 80;
          default: return 0;
        }
      };
      
      // Get previous and new storage values
      const previousAdjustment = previousStorage ? getStorageValue(previousStorage, phoneDetails.brand) : 0;
      const newAdjustment = getStorageValue(value, phoneDetails.brand);
      
      priceAdjustment = priceAdjustment - previousAdjustment + newAdjustment;
    }
    
    // Ensure the price stays within 50-600 range
    priceAdjustment = Math.min(Math.max(priceAdjustment, 50), 600);
    
    if (name === "price") {
      // If user manually sets price, use that instead but keep within range
      const manualPrice = parseInt(value) || 0;
      const adjustedPrice = Math.min(Math.max(manualPrice, 50), 600);
      setPhoneDetails({ ...phoneDetails, [name]: adjustedPrice });
    } else {
      setPhoneDetails({ ...phoneDetails, [name]: value });
      
      // Only update estimated price if not manually setting price
      if (name === "condition" || name === "storage") {
        setEstimatedPrice(priceAdjustment);
        setPhoneDetails({ ...phoneDetails, [name]: value, price: priceAdjustment });
      }
    }
  };

  // Handle file input change for image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPhoneDetails({ ...phoneDetails, images: [...phoneDetails.images, ...filesArray] });
    }
  };

  // Remove an image from the selection
  const removeImage = (index: number) => {
    const updatedImages = [...phoneDetails.images];
    updatedImages.splice(index, 1);
    setPhoneDetails({ ...phoneDetails, images: updatedImages });
  };

  // Convert images to base64 for API submission
  const convertImagesToBase64 = async (images: File[]): Promise<string[]> => {
    const base64Images: string[] = [];
    
    for (const image of images) {
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          resolve(reader.result as string);
        };
      });
      
      reader.readAsDataURL(image);
      base64Images.push(await base64Promise);
    }
    
    return base64Images;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Convert images to base64
      const base64Images = await convertImagesToBase64(phoneDetails.images);
      
      // Get contact info from the form
      const contactInfo = {
        name: (document.getElementById('name') as HTMLInputElement)?.value || '',
        email: (document.getElementById('email') as HTMLInputElement)?.value || '',
        phone: (document.getElementById('phone') as HTMLInputElement)?.value || '',
        address: (document.getElementById('address') as HTMLInputElement)?.value || '',
      };
      
      // Validate contact info
      if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
        toast.error('Παρακαλώ συμπληρώστε τα στοιχεία επικοινωνίας');
        setIsSubmitting(false);
        return;
      }
      
      // Submit to API
      const response = await fetch("/api/phone-listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...phoneDetails,
          images: base64Images,
          ...contactInfo
        }),
      });
      
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.error || "Σφάλμα κατά την υποβολή της αγγελίας");
      }
      
      // Store the listing ID for reference
      setListingId(data.listing.id);
      
      // Send notification to admin about the new listing
      try {
        const notificationResponse = await fetch('/api/notifications/listing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: data.listing.id,
            brand: phoneDetails.brand,
            model: phoneDetails.model,
            storage: phoneDetails.storage,
            condition: phoneDetails.condition,
            price: estimatedPrice,
            description: phoneDetails.description,
            customerName: contactInfo.name,
            customerEmail: contactInfo.email,
            customerPhone: contactInfo.phone,
            customerAddress: contactInfo.address,
          }),
        });
        
        if (!notificationResponse.ok) {
          console.error('Failed to send admin notification about new listing');
        }
      } catch (notificationError) {
        console.error('Error sending admin notification about new listing:', notificationError);
      }
      
      // Move to success step
      setStep(5);
      toast.success("Η παραγγελία σας υποβλήθηκε με επιτυχία!");
    } catch (error) {
      console.error("Error submitting listing:", error);
      toast.error(error instanceof Error ? error.message : "Σφάλμα κατά την υποβολή της αγγελίας");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle contact info submission
  const handleContactSubmit = (data: BookingData) => {
    // In a real implementation, you might update the listing with contact info
    // or create a user account if they don't have one
    console.log("Contact info submitted:", data);
    
    // Move to success step
    setStep(5);
  };

  // Render different steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-[80%] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-16 mx-auto">
            {Object.keys(phoneOptions).map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandSelect(brand)}
                className="w-full h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:scale-105 dark:hover:bg-purple-900"
              >
                <Image
                  src={`/brands/${brand.toLowerCase()}.svg`}
                  alt={brand}
                  width={48}
                  height={48}
                  className="mb-3"
                />
                <span className="text-sm font-medium text-center dark:text-white text-gray-600">
                  {brand}
                </span>
              </button>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="w-[80%] mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center dark:text-white text-gray-600">
              {stepTitles[2]}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {phoneOptions[selectedBrand as keyof typeof phoneOptions].map((model) => (
                <button
                  key={model}
                  onClick={() => handleModelSelect(model)}
                  className="p-4 dark:text-white text-gray-600 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105 text-left dark:hover:bg-purple-900"
                >
                  {model}
                </button>
              ))}
              <button
                onClick={() => handleModelSelect("Άλλο")}
                className="p-4 dark:text-white text-gray-600 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all text-left hover:bg-purple-100 dark:hover:bg-purple-900"
              >
                Άλλο
              </button>
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-6 text-purple-600 hover:text-purple-700"
            >
              ← Πίσω στις εταιρίες
            </button>
          </div>
        );

      case 3:
        return (
          <div className="w-[80%] mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center dark:text-white text-gray-600">
              {stepTitles[3]}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Κατάσταση</label>
                  <div className="space-y-3">
                    {conditionOptions.map((option) => (
                      <label 
                        key={option.value} 
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          phoneDetails.condition === option.value 
                            ? "bg-purple-100 dark:bg-purple-900 border-purple-500" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="condition"
                          value={option.value}
                          checked={phoneDetails.condition === option.value}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium dark:text-white text-gray-600">{option.label}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="storage" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Αποθηκευτικός Χώρος</label>
                  <div className="grid grid-cols-2 gap-3">
                    {storageOptions.map((option) => (
                      <label 
                        key={option} 
                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          phoneDetails.storage === option 
                            ? "bg-purple-100 dark:bg-purple-900 border-purple-500" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="storage"
                          value={option}
                          checked={phoneDetails.storage === option}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="dark:text-white text-gray-600">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Εκτιμώμενη Τιμή</h3>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{estimatedPrice}€</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Η τιμή είναι ενδεικτική και βασίζεται στα στοιχεία που έχετε επιλέξει. 
                  Η τελική τιμή θα καθοριστεί μετά από επιθεώρηση της συσκευής από τους τεχνικούς μας.
                </p>
                
                {/* Price breakdown details */}
                <div className="mt-2 text-sm">
                  <details>
                    <summary className="cursor-pointer text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                      Δείτε ανάλυση τιμής
                    </summary>
                    <div className="mt-2 pl-2 border-l-2 border-purple-200 dark:border-purple-700">
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-600 dark:text-gray-400">Βασική τιμή συσκευής:</span>
                        <span className="text-right font-medium text-gray-800 dark:text-gray-200">
                          {estimatedPrice / (
                            phoneDetails.condition === "Excellent" ? 1 :
                            phoneDetails.condition === "VeryGood" ? 0.8 :
                            phoneDetails.condition === "Good" ? 0.65 :
                            phoneDetails.condition === "Fair" ? 0.45 : 1
                          )}€
                        </span>
                        
                        {phoneDetails.condition && (
                          <>
                            <span className="text-gray-600 dark:text-gray-400">
                              Προσαρμογή κατάστασης ({
                                phoneDetails.condition === "Excellent" ? "Άριστη" :
                                phoneDetails.condition === "VeryGood" ? "Πολύ Καλή" :
                                phoneDetails.condition === "Good" ? "Καλή" :
                                phoneDetails.condition === "Fair" ? "Μέτρια" : phoneDetails.condition
                              }):
                            </span>
                            <span className={`text-right font-medium ${
                              phoneDetails.condition !== "Excellent" ? "text-orange-600 dark:text-orange-400" : "text-gray-800 dark:text-gray-200"
                            }`}>
                              {phoneDetails.condition === "Excellent" ? "0€" : 
                               `-${Math.round(estimatedPrice / (
                                 phoneDetails.condition === "VeryGood" ? 0.8 :
                                 phoneDetails.condition === "Good" ? 0.65 :
                                 phoneDetails.condition === "Fair" ? 0.45 : 1
                               ) * (1 - (
                                 phoneDetails.condition === "VeryGood" ? 0.8 :
                                 phoneDetails.condition === "Good" ? 0.65 :
                                 phoneDetails.condition === "Fair" ? 0.45 : 1
                               )))}€`}
                            </span>
                          </>
                        )}
                        
                        {phoneDetails.storage && (
                          <>
                            <span className="text-gray-600 dark:text-gray-400">
                              Προσαύξηση αποθηκευτικού χώρου ({phoneDetails.storage}):
                            </span>
                            <span className="text-right font-medium text-green-600 dark:text-green-400">
                              {phoneDetails.storage === "64GB" ? "0€" : `+${
                                (phoneDetails.brand === "Apple" ? 
                                  (phoneDetails.storage === "128GB" ? 30 :
                                   phoneDetails.storage === "256GB" ? 60 :
                                   phoneDetails.storage === "512GB" ? 90 :
                                   phoneDetails.storage === "1TB" ? 120 : 0) :
                                  (phoneDetails.storage === "128GB" ? 20 :
                                   phoneDetails.storage === "256GB" ? 40 :
                                   phoneDetails.storage === "512GB" ? 60 :
                                   phoneDetails.storage === "1TB" ? 80 : 0)
                                )
                              }€`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </details>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Περιγραφή
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={phoneDetails.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-600 dark:text-white"
                  placeholder="Περιγράψτε τη συσκευή σας (προαιρετικά)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Φωτογραφίες
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="images" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      <span className="mt-2 text-gray-500 dark:text-gray-400">Προσθέστε φωτογραφίες</span>
                      <span className="mt-1 text-sm text-gray-400">Μέχρι 5 φωτογραφίες</span>
                    </div>
                  </label>
                </div>
                
                {phoneDetails.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {phoneDetails.images.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <Image src={URL.createObjectURL(image)} alt={`Uploaded ${index + 1}`}
                            className="w-full h-full object-cover"
                            width={100}
                            height={100}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Contact Information */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4 dark:text-white text-gray-600">Στοιχεία Επικοινωνίας</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Ονοματεπώνυμο
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-600 dark:text-white"
                      placeholder="Το ονοματεπώνυμό σας"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-600 dark:text-white"
                      placeholder="Το email σας"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Τηλέφωνο
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-600 dark:text-white"
                      placeholder="Το τηλέφωνό σας"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Διεύθυνση
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-600 dark:text-white"
                      placeholder="Η διεύθυνσή σας (προαιρετικά)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  ← Πίσω στα μοντέλα
                </button>
                <button
                  type="submit"
                  disabled={!phoneDetails.condition || !phoneDetails.storage || phoneDetails.price <= 0 || isSubmitting}
                  className={`px-8 py-3 rounded-lg ${
                    phoneDetails.condition && phoneDetails.storage && phoneDetails.price > 0 && !isSubmitting
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Υποβολή...
                    </span>
                  ) : (
                    "Υποβολή"
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 4:
        return (
          <PaymentSection
            totalAmount={0} // No payment needed for selling
            itemDetails={[
              {
                title: `${phoneDetails.brand} ${phoneDetails.model} - ${phoneDetails.storage} - ${
                  conditionOptions.find(c => c.value === phoneDetails.condition)?.label || phoneDetails.condition
                }`,
                price: phoneDetails.price,
              },
            ]}
            onComplete={handleContactSubmit}
            pageId={2} // Using pageId 1 to skip payment processing
          />
        );
        
      case 5:
        return (
          <div className="w-[80%] mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4 dark:text-white text-gray-600">
                Η παραγγελία σας υποβλήθηκε με επιτυχία!
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Η παραγγελία σας για το {phoneDetails.brand} {phoneDetails.model} έχει υποβληθεί και βρίσκεται υπό έγκριση. 
                Θα σας ενημερώσουμε μέσω email μόλις εγκριθεί.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Αριθμός Αγγελίας: <span className="font-medium text-gray-700 dark:text-gray-300">{listingId}</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Επιστροφή στην Αρχική
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col overflow-hidden min-h-[100dvh] bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      <Navbar />

      <main className="flex-grow w-full mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 dark:text-white text-gray-600">
            {stepTitles[step]}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {stepDescriptions[step]}
          </p>
        </div>

        {step < 5 && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex justify-between mb-2">
              {["Εταιρεία", "Μοντέλο", "Λεπτομέρειες", "Ολοκλήρωση"].map((label, index) => (
                <div
                  key={label}
                  className={`text-sm ${
                    step > index
                      ? "text-purple-600"
                      : step === index + 1
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {renderStep()}
      </main>
      
      {/* Footer */}
      <footer className="py-5 flex items-center justify-center gap-8 text-sm text-gray-700 dark:text-gray-400 border-t border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400">Πολιτική Απορρήτου & Όροι Χρήσης</Link>
        <Link href="/faq" className="hover:text-purple-600 dark:hover:text-purple-400">Συχνές Ερωτήσεις</Link>
      </footer>
    </div>
  );
};

export default SellPhonePage;
