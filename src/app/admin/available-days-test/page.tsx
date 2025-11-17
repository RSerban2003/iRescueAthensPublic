"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AvailableDaysTest() {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const createTestDays = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/test-days');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create test days');
      }
      
      const data = await response.json();
      toast.success(`Created ${data.days.length} test days`);
      
      // Fetch the days after creating them
      fetchDays();
    } catch (error) {
      console.error('Error creating test days:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to create test days');
    } finally {
      setLoading(false);
    }
  };

  const fetchDays = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/available-days');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch days');
      }
      
      const data = await response.json();
      setDays(data.days || []);
    } catch (error) {
      console.error('Error fetching days:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to fetch days');
    } finally {
      setLoading(false);
    }
  };

  // Fetch days on mount
  useEffect(() => {
    fetchDays();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-700 dark:text-white">Available Days Test</h1>
            <div className="space-x-2">
              <Link 
                href="/admin" 
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Admin
              </Link>
              <button
                onClick={createTestDays}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? 'Processing...' : 'Create Test Days'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This page allows you to quickly create test data for available days. Clicking "Create Test Days" will:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>Delete all existing available days</li>
            <li>Create 10 new days starting from today</li>
            <li>Every third day will be marked as inactive</li>
            <li>Add sample notes to some days</li>
          </ul>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Current Available Days</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : days.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Full Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {days.map((day: any) => (
                      <tr key={day.id} className={!day.isActive ? "opacity-60" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-white">
                          {new Date(day.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-white">
                          {day.fullDay ? "Yes" : "No"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-white">
                          {day.note || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              day.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {day.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No available days found. Click "Create Test Days" to generate some test data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 