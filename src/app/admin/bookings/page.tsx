"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

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
                href="/admin" 
                className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/bookings" 
                className="block p-2 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200"
              >
                Bookings
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/phone-listings" 
                className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
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

// Booking interface
interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: string;
  type: string;
  brand: string;
  model: string;
  issues: string[];
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
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
export default function BookingsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [phoneFilter, setPhoneFilter] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  
  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as ExtendedUser;
      if (user?.role !== "admin") {
        toast.error("You don't have permission to access this page");
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/admin/login?callbackUrl=/admin/bookings");
    }
  }, [session, status, router]);
  
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/bookings');

        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/admin/login?callbackUrl=/admin/bookings");
          return;
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        
        const data = await response.json();
        setBookings(data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    
    if (status === "authenticated" && (session?.user as ExtendedUser)?.role === "admin") {
      fetchBookings();
    }
  }, [session, status]);
  
  // Handle status change
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }
      
      // Update bookings
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      // Update selected booking if needed
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
      
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
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
    switch (status.toUpperCase()) {
      case "PENDING":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case "CONFIRMED":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Confirmed</span>;
      case "COMPLETED":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      case "CANCELLED":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  // Filter bookings based on status
  const filteredBookings = (filterStatus === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status.toUpperCase() === filterStatus.toUpperCase()))
    .filter(booking => 
      phoneFilter === '' || 
      booking.phone.toLowerCase().includes(phoneFilter.toLowerCase())
    );

  // Add handler for notes update
  const handleNotesUpdate = async (bookingId: string, notes: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update booking notes");
      }
      
      // Update bookings
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, notes } : booking
      ));
      
      // Update selected booking if needed
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, notes });
      }
      
      setEditingNotes(false);
      toast.success("Booking notes updated successfully");
    } catch (error) {
      console.error("Error updating booking notes:", error);
      toast.error("Failed to update booking notes");
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
      <div className="mb-8 p-4 bg-white shadow-sm rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by phone..."
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
            />
            {phoneFilter && (
              <button
                onClick={() => setPhoneFilter('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No bookings found with the selected status</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Booking detail view */}
          {selectedBooking && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Booking Details ({selectedBooking.type})
                  </h2>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Status</h3>
                      <div className="flex items-center justify-between">
                        <div>{getStatusBadge(selectedBooking.status)}</div>
                        <select
                          value={selectedBooking.status}
                          onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value)}
                          className="ml-4 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Appointment Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                          <p className="text-gray-900 dark:text-white">{formatDate(selectedBooking.date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Time Slot</p>
                          <p className="text-gray-900 dark:text-white">{selectedBooking.timeSlot}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Device Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Brand</p>
                          <p className="text-gray-900 dark:text-white">{selectedBooking.brand}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
                          <p className="text-gray-900 dark:text-white">{selectedBooking.model}</p>
                        </div>
                      </div>
                      {selectedBooking.type === "REPAIR" && selectedBooking.issues && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Issues to Fix</p>
                          <ul className="list-disc ml-5 text-gray-900 dark:text-white">
                            {selectedBooking.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedBooking.type === "PRODUCT" && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                          <p className="text-gray-900 dark:text-white">{selectedBooking.brand} {selectedBooking.model}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedBooking.totalAmount && (
                      <div className="mb-6">
                        <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Payment Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBooking.totalAmount}€</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Method</p>
                            <p className="text-gray-900 dark:text-white">{selectedBooking.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                            <p className="text-gray-900 dark:text-white">{selectedBooking.paymentStatus}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        Additional Information
                        {!editingNotes && (
                          <button 
                            onClick={() => {
                              setNotesValue(selectedBooking.notes || "");
                              setEditingNotes(true);
                            }}
                            className="ml-2 text-blue-500 hover:text-blue-700 text-sm font-normal"
                          >
                            Edit Notes
                          </button>
                        )}
                      </h3>
                      
                      {editingNotes ? (
                        <div>
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 mb-2"
                            rows={5}
                            placeholder="Add notes about this booking..."
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingNotes(false)}
                              className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleNotesUpdate(selectedBooking.id, notesValue)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                            {selectedBooking.notes || "No notes provided"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Customer Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                          <p className="text-gray-900 dark:text-white">{selectedBooking.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-gray-900 dark:text-white">{selectedBooking.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="text-gray-900 dark:text-white">{selectedBooking.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedBooking.address || "No address provided"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Booking Information</h3>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                        <p className="text-gray-900 dark:text-white">{formatDate(selectedBooking.createdAt)}</p>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.id}</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Actions</h3>
                      <div className="flex flex-col space-y-3">
                        <button 
                          onClick={() => window.open(`mailto:${selectedBooking.email}?subject=Regarding Your Booking #${selectedBooking.id}`, '_blank')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Email Customer
                        </button>
                        <button 
                          onClick={() => {navigator.clipboard.writeText(selectedBooking.id); toast.success('Booking ID copied to clipboard');}}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          Copy Booking ID
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Bookings Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatDate(booking.date)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{booking.timeSlot}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">{booking.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{booking.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.type === 'REPAIR' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {booking.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">{booking.brand}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{booking.model}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 