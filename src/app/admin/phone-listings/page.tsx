"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

// Admin layout component
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Panel</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin/dashboard" 
                className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/bookings" 
                className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Bookings
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/phone-listings" 
                className="block p-2 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200"
              >
                Phone Listings
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Users
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/settings" 
                className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

// Phone listing type
interface PhoneListing {
  id: string;
  brand: string;
  model: string;
  storage: string;
  condition: string;
  price: number;
  description: string;
  images: string[];
  status: string;
  createdAt: string;
  address: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  phone: string;
}

// Extended user type to include role
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  role?: string;
}

// Main component
export default function PhoneListingsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [listings, setListings] = useState<PhoneListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<PhoneListing | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  
  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated") {
      if ((session?.user as ExtendedUser)?.role !== "admin") {
        toast.error("You don't have permission to access this page");
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/phone-listings");
    }
  }, [session, status, router]);
  
  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/phone-listings?status=${filterStatus}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }
        
        const data = await response.json();
        setListings(data.listings);
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("Failed to load phone listings");
      } finally {
        setLoading(false);
      }
    };
    
    if (status === "authenticated" && (session?.user as ExtendedUser)?.role === "admin") {
      fetchListings();
    }
  }, [filterStatus, session, status]);
  
  // Handle status change
  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/phone-listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update listing status");
      }
      
      // Update listings
      setListings(listings.map(listing => 
        listing.id === listingId ? { ...listing, status: newStatus } : listing
      ));
      
      // Close detail view if open
      if (selectedListing?.id === listingId) {
        setSelectedListing({ ...selectedListing, status: newStatus });
      }
      
      toast.success(`Listing ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating listing status:", error);
      toast.error("Failed to update listing status");
    }
  };
  
  // Handle delete listing
  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/phone-listings/${listingId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }
      
      // Remove from listings
      setListings(listings.filter(listing => listing.id !== listingId));
      
      // Close detail view if open
      if (selectedListing?.id === listingId) {
        setSelectedListing(null);
      }
      
      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("el-GR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case "approved":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      case "sold":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Sold</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  if (status === "loading" || (status === "authenticated" && !session?.user)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Phone Listings</h1>
        
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="sold">Sold</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No phone listings found with status: {filterStatus}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Listing detail view */}
          {selectedListing && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {selectedListing.brand} {selectedListing.model}
                  </h2>
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left column - Images */}
                  <div>
                    {selectedListing.images.length > 0 ? (
                      <div>
                        <Image
                          src={selectedListing.images[0]}
                          alt={`${selectedListing.brand} ${selectedListing.model}`}
                          className="w-full h-60 object-cover rounded-lg mb-4"
                          width={200}
                          height={200}
                        />
                        
                        {/* Thumbnail images */}
                        {selectedListing.images.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {selectedListing.images.slice(1).map((image, index) => (
                              <Image
                                key={index}
                                src={image}
                                alt={`${selectedListing.brand} ${selectedListing.model} ${index + 2}`}
                                className="w-full h-20 object-cover rounded-lg"
                                width={200}
                                height={200}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-60 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">No images available</span>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Status</h3>
                      <div className="mt-1">{getStatusBadge(selectedListing.status)}</div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Price</h3>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{selectedListing.price}€</p>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Storage</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">{selectedListing.storage}</p>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Condition</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">{selectedListing.condition}</p>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Description</h3>
                      <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{selectedListing.description || "No description provided"}</p>
                    </div>
                  </div>
                  
                  {/* Right column - Seller info and actions */}
                  <div>
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Seller Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                          <p className="text-gray-900 dark:text-white">{selectedListing.user.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-gray-900 dark:text-white">{selectedListing.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="text-gray-900 dark:text-white">{selectedListing.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedListing.address || "No address provided"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Listing Information</h3>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                        <p className="mt-1 text-gray-900 dark:text-white">{formatDate(selectedListing.createdAt)}</p>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Listing ID</p>
                        <p className="mt-1 text-gray-900 dark:text-white">{selectedListing.id}</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Actions</h3>
                      <div className="space-y-4">
                        {selectedListing.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(selectedListing.id, "approved")}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-1"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(selectedListing.id, "rejected")}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-1"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        
                        {selectedListing.status === "approved" && (
                          <button
                            onClick={() => handleStatusChange(selectedListing.id, "sold")}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Mark as Sold
                          </button>
                        )}
                        
                        {(selectedListing.status === "rejected" || selectedListing.status === "sold") && (
                          <button
                            onClick={() => handleStatusChange(selectedListing.id, "approved")}
                            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                          >
                            Reactivate Listing
                          </button>
                        )}
                        
                        <button 
                          onClick={() => window.open(`mailto:${selectedListing.user.email}?subject=Regarding Your Phone Listing #${selectedListing.id}`, '_blank')}
                          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          Email Seller
                        </button>
                        
                        <button 
                          onClick={() => {navigator.clipboard.writeText(selectedListing.id); toast.success('Listing ID copied to clipboard');}}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Copy Listing ID
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(selectedListing.id)}
                          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                        >
                          Delete Listing
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Listings table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Seller
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {listing.images.length > 0 ? (
                            <Image
                              src={listing.images[0]}
                              alt={`${listing.brand} ${listing.model}`}
                              className="h-10 w-10 rounded-full object-cover"
                              width={200}
                              height={200}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {listing.brand} {listing.model}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {listing.storage} • {listing.condition}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{listing.price}€</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{listing.user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{listing.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 