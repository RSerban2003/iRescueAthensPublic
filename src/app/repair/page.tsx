"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import "@/components/Calendar.css";
import { PaymentSection } from "@/components/PaymentSection";
import Link from "next/link";

const phoneOptions = {
  Apple: [
    'iphone 15 pro',
    'iphone 15 pro max',
    'iphone 15',
    'iphone 15 plus',
    'iphone 14 pro',
    'iphone 14 pro max',
    'iphone 14',
    'iphone 14 plus',
    'iphone 13 pro',
    'iphone 13 pro max',
    'iphone 13',
    'iphone 13 mini',
    'iphone 12 pro',
    'iphone 12 pro max',
    'iphone 12',
    'iphone 12 mini',
    'iphone 11 pro',
    'iphone 11 pro max',
    'iphone 11',
    'iphone XR',
    'iphone X',
    'iphone XS',
    'iphone XS max',
    'iphone 8',
    'iphone 8 plus',
    'iphone 7',
    'iphone 7 plus',
    'iphone 6',
    'iphone 6 plus',
    'iphone 6s',
    'iphone 6s plus',
    'iphone SE 2020',
    'iphone SE 2022'
  ],
  Samsung: [
    'S24 Ultra',
    'S24 Plus',
    'S24',
    'S23 Ultra',
    'S23 Plus',
    'S23',
    'S22 Ultra',
    'S22 Plus',
    'S22',
    'S21 Ultra',
    'S21 Plus',
    'S21',
    'S21 FE',
    'S20 Ultra',
    'S20 Plus',
    'S20',
    'S20 FE 4G',
    'S20 FE 5G',
    'S10',
    'S10 5G',
    'S10 Plus',
    'S10 Lite',
    'S10 e',
    'S9',
    'S9 Plus',
    'S8',
    'S8 Plus',
    'Note 20 Ultra',
    'Note20',
    'Note 10 lite',
    'Note 10 Plus',
    'Note 10',
    'Note 9',
    'Note 8',
    'Galaxy A(2015)',
    'Galaxy A(2016)',
    'Galaxy A(2017)',
    'Galaxy A(2018)',
    'Ax0',
    'Ax1',
    'Ax2',
    'Ax3',
    'Ax4',
    'Ax5',
    'Ax6',
    'Z Flip 4',
    'Z Flip 5',
    'Z Fold 4',
    'Z Fold 5'
  ],
  Google: [
    'Pixel 8 Pro',
    'Pixel 8',
    'Pixel 7 Pro',
    'Pixel 7',
    'Pixel 6 Pro',
    'Pixel 6',
    'Pixel 5',
    'Pixel 4a',
    'Pixel 4 XL',
    'Pixel 4'
  ],
  Huawei: [
    'Mate 60 Pro',
    'Mate 50 Pro',
    'Mate 40 Pro',
    'P60 Pro',
    'P50 Pro',
    'P40 Pro',
    'Nova 11',
    'Nova 10',
    'Nova 9'
  ],
  Xiaomi: [
    'Redmi Note 8 Pro',
    'Redmi Note 9 Pro',
    'Redmi Note 9',
    'Redmi Note 10 Pro 5G',
    'Redmi Note 10 5G',
    'Redmi Note 11 Pro 5G',
    'Redmi Note 11 4G',
    'Redmi Note 11s 4G',
    'Redmi Note 12 Pro 5G',
    'Redmi Note 13 5G',
    'Redmi Note 13 Pro 5G',
    'Redmi Note 14 Pro+',
    'Poco C65',
    'Poco F5 5G',
    'Poco X6 5G',
    'Poco X6 Pro 5G',
    'Poco M6 Pro 5G',
    'Poco X5 Pro 5G',
    'Poco M5s'
  ],
  OnePlus: [
    '11 5G',
    '10 Pro',
    '10T',
    'Nord 3',
    'Nord CE 3',
    'Nord N30',
    'Nord N20'
  ],
  Αλλο: [
    
  ]
};

// Pricing data structure
type PriceInfo = {
  part: number;
  price: number;
};

type ScreenRepairOptions = {
  [key: string]: PriceInfo;
};

type RepairPricing = {
  screenRepair?: ScreenRepairOptions;
  battery?: PriceInfo;
  chargingPort?: PriceInfo;
  camera?: PriceInfo;
  backCover?: PriceInfo;
};

type BrandPricing = {
  [model: string]: RepairPricing;
};


// Xiaomi Pricing Structure
const xiaomiPricing: BrandPricing = {
  // Redmi Note Series
  "Redmi Note 8 Pro": {
    screenRepair: {
      original: { part: 79, price: 79 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 9 Pro": {
    screenRepair: {
      original: { part: 79, price: 79 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 9": {
    screenRepair: {
      original: { part: 79, price: 79 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 10 Pro 5G": {
    screenRepair: {
      original: { part: 110, price: 110 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 10 5G": {
    screenRepair: {
      original: { part: 89, price: 89 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 11 Pro 5G": {
    screenRepair: {
      original: { part: 105, price: 105 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 11 4G": {
    screenRepair: {
      original: { part: 89, price: 89 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 11s 4G": {
    screenRepair: {
      original: { part: 110, price: 110 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 12 Pro 5G": {
    screenRepair: {
      original: { part: 89, price: 89 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 13 5G": {
    screenRepair: {
      original: { part: 89, price: 89 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 13 Pro 5G": {
    screenRepair: {
      original: { part: 110, price: 110 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Redmi Note 14 Pro+": {
    screenRepair: {
      original: { part: 129, price: 129 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },

  // Poco Series
  "Poco C65": {
    screenRepair: {
      original: { part: 69, price: 69 }
    },
    battery: { part: 55, price: 55 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Poco F5 5G": {
    screenRepair: {
      original: { part: 99, price: 99 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Poco X6 5G": {
    screenRepair: {
      original: { part: 159, price: 159 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Poco X6 Pro 5G": {
    screenRepair: {
      original: { part: 129, price: 129 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Poco M6 Pro 5G": {
    screenRepair: {
      original: { part: 119, price: 119 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Poco X5 Pro 5G": {
    screenRepair: {
      original: { part: 119, price: 119 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },
  "Poco M5s": {
    screenRepair: {
      original: { part: 99, price: 99 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  },

  // Other Xiaomi Models
  "Mi 13 Pro": {
    screenRepair: {
      original: { part: 0, price: 0 }
    },
    battery: { part: 0, price: 0 },
    chargingPort: { part: 0, price: 0 },
    backCover: { part: 0, price: 0 },
    camera: { part: 0, price: 0 }
  }
};
// OnePlus Pricing Structure


// iPhone Pricing Structure
const iphonePricing: BrandPricing = {
  // iPhone 15 Series
  "iphone 15": {
    screenRepair: {
      hq: { part: 249, price: 249 },
      standard: { part: 249, price: 249 }
    },
    battery: { part: 79, price: 79 },
    chargingPort: { part: 159, price: 159 },
    camera: { part: 149, price: 149 },
    backCover: { part: 149, price: 149 }
  },
  "iphone 15 plus": {
    screenRepair: {
      hq: { part: 279, price: 279 },
      standard: { part: 279, price: 279 }
    },
    battery: { part: 79, price: 79 },
    chargingPort: { part: 169, price: 169 },
    camera: { part: 149, price: 149 },
    backCover: { part: 159, price: 159 }
  },
  "iphone 15 pro": {
    screenRepair: {
      hq: { part: 319, price: 319 },
      standard: { part: 319, price: 319 }
    },
    battery: { part: 79, price: 79 },
    chargingPort: { part: 179, price: 179 },
    camera: { part: 179, price: 179 },
    backCover: { part: 169, price: 169 }
  },
  "iphone 15 pro max": {
    screenRepair: {
      hq: { part: 369, price: 369 },
      standard: { part: 369, price: 369 }
    },
    battery: { part: 79, price: 79 },
    chargingPort: { part: 189, price: 189 },
    camera: { part: 179, price: 179 },
    backCover: { part: 179, price: 179 }
  },

  // iPhone 14 Series
  "iphone 14": {
    screenRepair: {
      hq: { part: 199, price: 199 },
      standard: { part: 199, price: 199 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 89, price: 89 },
    camera: { part: 249, price: 249 },
    backCover: { part: 139, price: 139 }
  },
  "iphone 14 plus": {
    screenRepair: {
      hq: { part: 219, price: 219 },
      standard: { part: 219, price: 219 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 79, price: 79 },
    camera: { part: 249, price: 249 },
    backCover: { part: 129, price: 129 }
  },
  "iphone 14 pro": {
    screenRepair: {
      hq: { part: 299, price: 299 },
      standard: { part: 299, price: 299 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 85, price: 85 },
    camera: { part: 259, price: 259 },
    backCover: { part: 299, price: 299 }
  },
  "iphone 14 pro max": {
    screenRepair: {
      hq: { part: 339, price: 339 },
      standard: { part: 339, price: 339 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 85, price: 85 },
    camera: { part: 259, price: 259 },
    backCover: { part: 319, price: 319 }
  },

  // iPhone 13 Series
  "iphone 13": {
    screenRepair: {
      hq: { part: 179, price: 179 },
      standard: { part: 179, price: 179 }
    },
    battery: { part: 55, price: 55 },
    chargingPort: { part: 79, price: 79 },
    camera: { part: 239, price: 239 },
    backCover: { part: 199, price: 199 }
  },
  "iphone 13 mini": {
    screenRepair: {
      hq: { part: 169, price: 169 },
      standard: { part: 169, price: 169 }
    },
    battery: { part: 55, price: 55 },
    chargingPort: { part: 79, price: 79 },
    camera: { part: 119, price: 119 },
    backCover: { part: 149, price: 149 }
  },
  "iphone 13 pro": {
    screenRepair: {
      hq: { part: 249, price: 249 },
      standard: { part: 249, price: 249 }
    },
    battery: { part: 55, price: 55 },
    chargingPort: { part: 89, price: 89 },
    camera: { part: 219, price: 219 },
    backCover: { part: 219, price: 219 }
  },
  "iphone 13 pro max": {
    screenRepair: {
      hq: { part: 279, price: 279 },
      standard: { part: 279, price: 279 }
    },
    battery: { part: 55, price: 55 },
    chargingPort: { part: 89, price: 89 },
    camera: { part: 169, price: 169 },
    backCover: { part: 179, price: 179 }
  },

  // iPhone 12 Series
  "iphone 12": {
    screenRepair: {
      hq: { part: 189, price: 189 },
      standard: { part: 189, price: 189 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 69, price: 69 },
    camera: { part: 99, price: 99 },
    backCover: { part: 149, price: 149 }
  },
  "iphone 12 pro": {
    screenRepair: {
      hq: { part: 189, price: 189 },
      standard: { part: 189, price: 189 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 69, price: 69 },
    camera: { part: 99, price: 99 },
    backCover: { part: 159, price: 159 }
  },
  "iphone 12 pro max": {
    screenRepair: {
      hq: { part: 219, price: 219 },
      standard: { part: 219, price: 219 }
    },
    battery: { part: 55, price: 55 },
    chargingPort: { part: 69, price: 69 },
    camera: { part: 159, price: 159 },
    backCover: { part: 179, price: 179 }
  },
  "iphone 12 mini": {
    screenRepair: {
      hq: { part: 149, price: 149 },
      standard: { part: 149, price: 149 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 69, price: 69 },
    camera: { part: 159, price: 159 },
    backCover: { part: 139, price: 139 }
  },

  // iPhone 11 Series
  "iphone 11": {
    screenRepair: {
      hq: { part: 69, price: 69 },
      standard: { part: 69, price: 69 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 49, price: 49 },
    camera: { part: 69, price: 69 },
    backCover: { part: 99, price: 99 }
  },
  "iphone 11 pro": {
    screenRepair: {
      hq: { part: 129, price: 129 },
      standard: { part: 129, price: 129 }
    },
    battery: { part: 55, price: 55 },
    chargingPort: { part: 69, price: 69 },
    camera: { part: 109, price: 109 },
    backCover: { part: 119, price: 119 }
  },
  "iphone 11 pro max": {
    screenRepair: {
      hq: { part: 159, price: 159 },
      standard: { part: 159, price: 159 }
    },
    battery: { part: 55, price: 55 },
    chargingPort: { part: 69, price: 69 },
    camera: { part: 109, price: 109 },
    backCover: { part: 139, price: 139 }
  },

  // Older Models
  "iphone XR": {
    screenRepair: {
      hq: { part: 79, price: 79 },
      standard: { part: 79, price: 79 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 49, price: 49 },
    camera: { part: 69, price: 69 }
  },
  "iphone X": {
    screenRepair: {
      hq: { part: 99, price: 99 },
      standard: { part: 99, price: 99 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 49, price: 49 },
    camera: { part: 69, price: 69 }
  },
  "iphone XS": {
    screenRepair: {
      hq: { part: 109, price: 109 },
      standard: { part: 109, price: 109 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 49, price: 49 },
    camera: { part: 79, price: 79 }
  },
  "iphone XS max": {
    screenRepair: {
      hq: { part: 119, price: 119 },
      standard: { part: 119, price: 119 }
    },
    battery: { part: 49, price: 49 },
    chargingPort: { part: 49, price: 49 },
    camera: { part: 79, price: 79 }
  },
  "iphone 8": {
    screenRepair: {
      hq: { part: 59, price: 59 },
      standard: { part: 59, price: 59 }
    },
    battery: { part: 39, price: 39 },
    chargingPort: { part: 49, price: 49 },
    camera: { part: 59, price: 59 }
  },
  "iphone 8 plus": {
    screenRepair: {
      hq: { part: 59, price: 59 },
      standard: { part: 59, price: 59 }
    },
    battery: { part: 39, price: 39 },
    chargingPort: { part: 49, price: 49 },
    camera: { part: 69, price: 69 }
  },
  "iphone 7": {
    screenRepair: {
      hq: { part: 49, price: 49 },
      standard: { part: 49, price: 49 }
    },
    battery: { part: 39, price: 39 },
    chargingPort: { part: 49, price: 49 },
    camera: { part: 59, price: 59 }
  },
  "iphone 7 plus": {
    screenRepair: {
      hq: { part: 59, price: 59 },
      standard: { part: 59, price: 59 }
    },
    battery: { part: 39, price: 39 },
    chargingPort: { part: 49, price: 49 },
    camera: { part: 79, price: 79 }
  },
  "iphone 6": {
    screenRepair: {
      hq: { part: 49, price: 49 },
      standard: { part: 49, price: 49 }
    },
    battery: { part: 39, price: 39 },
    chargingPort: { part: 39, price: 39 },
    camera: { part: 39, price: 39 }
  },
  "iphone 6 plus": {
    screenRepair: {
      hq: { part: 55, price: 55 },
      standard: { part: 55, price: 55 }
    },
    battery: { part: 39, price: 39 },
    chargingPort: { part: 39, price: 39 },
    camera: { part: 39, price: 39 }
  },
  "iphone 6s": {
    screenRepair: {
      hq: { part: 59, price: 59 },
      standard: { part: 59, price: 59 }
    },
    battery: { part: 39, price: 39 },
    chargingPort: { part: 39, price: 39 },
    camera: { part: 39, price: 39 }
  },
  "iphone 6s plus": {
    screenRepair: {
      hq: { part: 59, price: 59 },
      standard: { part: 59, price: 59 }
    },
    battery: { part: 39, price: 39 },
    chargingPort: { part: 39, price: 39 },
    camera: { part: 39, price: 39 }
  },
  "iphone SE 2020": {
    screenRepair: {
      hq: { part: 59, price: 59 },
      standard: { part: 59, price: 59 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 69, price: 69 },
    camera: { part: 69, price: 69 }
  },
  "iphone SE 2022": {
    screenRepair: {
      hq: { part: 59, price: 59 },
      standard: { part: 59, price: 59 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 69, price: 69 },
    camera: { part: 69, price: 69 }
  }
};

// Samsung Pricing Structure
const samsungPricing: BrandPricing = {
  // S24 Series
  "S24 Ultra": {
    screenRepair: {
      original: { part: 420, price: 420 },
      withFrame: { part: 420, price: 420 }
    },
    battery: { part: 89, price: 89 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 75, price: 75 }
  },
  "S24 Plus": {
    screenRepair: {
      original: { part: 259, price: 259 },
      withFrame: { part: 259, price: 259 }
    },
    battery: { part: 79, price: 79 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 70, price: 70 }
  },
  "S24": {
    screenRepair: {
      original: { part: 229, price: 229 },
      withFrame: { part: 229, price: 229 }
    },
    battery: { part: 79, price: 79 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 70, price: 70 }
  },

  // S23 Series
  "S23 Ultra": {
    screenRepair: {
      original: { part: 439, price: 439 },
      withFrame: { part: 439, price: 439 }
    },
    battery: { part: 89, price: 89 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 79, price: 79 }
  },
  "S23 Plus": {
    screenRepair: {
      original: { part: 239, price: 239 },
      withFrame: { part: 239, price: 239 }
    },
    battery: { part: 79, price: 79 },
    chargingPort: { part: 75, price: 75 },
    backCover: { part: 69, price: 69 }
  },
  "S23": {
    screenRepair: {
      original: { part: 229, price: 229 },
      withFrame: { part: 229, price: 229 }
    },
    battery: { part: 79, price: 79 },
    chargingPort: { part: 69, price: 69 },
    backCover: { part: 69, price: 69 }
  },

  // S22 Series
  "S22 Ultra": {
    screenRepair: {
      original: { part: 310, price: 310 },
      withFrame: { part: 310, price: 310 }
    },
    battery: { part: 79, price: 79 },
    chargingPort: { part: 69, price: 69 },
    backCover: { part: 79, price: 79 }
  },
  "S22 Plus": {
    screenRepair: {
      original: { part: 215, price: 215 },
      withFrame: { part: 215, price: 215 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 69, price: 69 },
    backCover: { part: 69, price: 69 }
  },
  "S22": {
    screenRepair: {
      original: { part: 209, price: 209 },
      withFrame: { part: 209, price: 209 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 65, price: 65 },
    backCover: { part: 69, price: 69 }
  },

  // S21 Series
  "S21 Ultra": {
    screenRepair: {
      original: { part: 349, price: 349 },
      withFrame: { part: 349, price: 349 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 65, price: 65 },
    backCover: { part: 79, price: 79 }
  },
  "S21 Plus": {
    screenRepair: {
      original: { part: 229, price: 229 },
      withFrame: { part: 229, price: 229 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 60, price: 60 },
    backCover: { part: 59, price: 59 }
  },
  "S21": {
    screenRepair: {
      original: { part: 219, price: 219 },
      withFrame: { part: 219, price: 219 }
    },
    battery: { part: 65, price: 65 },
    chargingPort: { part: 60, price: 60 },
    backCover: { part: 69, price: 69 }
  },
  "S21 FE": {
    screenRepair: {
      original: { part: 179, price: 179 },
      withFrame: { part: 179, price: 179 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 60, price: 60 },
    backCover: { part: 59, price: 59 }
  },

  // S20 Series
  "S20 Ultra": {
    screenRepair: {
      original: { part: 269, price: 269 },
      withFrame: { part: 269, price: 269 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 65, price: 65 },
    backCover: { part: 69, price: 69 }
  },
  "S20 Plus": {
    screenRepair: {
      original: { part: 249, price: 249 },
      withFrame: { part: 249, price: 249 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 65, price: 65 },
    backCover: { part: 69, price: 69 }
  },
  "S20": {
    screenRepair: {
      original: { part: 249, price: 249 },
      withFrame: { part: 249, price: 249 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 59, price: 59 },
    backCover: { part: 65, price: 65 }
  },
  "S20 FE 4G": {
    screenRepair: {
      original: { part: 149, price: 149 },
      withFrame: { part: 149, price: 149 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 59, price: 59 },
    backCover: { part: 65, price: 65 }
  },
  "S20 FE 5G": {
    screenRepair: {
      original: { part: 149, price: 149 },
      withFrame: { part: 149, price: 149 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 59, price: 59 },
    backCover: { part: 65, price: 65 }
  },

  // S10 Series
  "S10": {
    screenRepair: {
      original: { part: 219, price: 219 },
      withFrame: { part: 219, price: 219 }
    },
    battery: { part: 60, price: 60 },
    chargingPort: { part: 69, price: 69 },
    backCover: { part: 49, price: 49 }
  },
  "S10 5G": {
    screenRepair: {
      original: { part: 249, price: 249 },
      withFrame: { part: 249, price: 249 }
    },
    battery: { part: 65, price: 65 },
    chargingPort: { part: 69, price: 69 },
    backCover: { part: 49, price: 49 }
  },
  "S10 Plus": {
    screenRepair: {
      original: { part: 259, price: 259 },
      withFrame: { part: 259, price: 259 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 59, price: 59 }
  },
  "S10 Lite": {
    screenRepair: {
      original: { part: 169, price: 169 },
      withFrame: { part: 169, price: 169 }
    },
    battery: { part: 65, price: 65 },
    chargingPort: { part: 69, price: 69 },
    backCover: { part: 59, price: 59 }
  },
  "S10 e": {
    screenRepair: {
      original: { part: 189, price: 189 },
      withFrame: { part: 189, price: 189 }
    },
    battery: { part: 65, price: 65 },
    chargingPort: { part: 69, price: 69 },
    backCover: { part: 59, price: 59 }
  },

  // S9 Series
  "S9": {
    screenRepair: {
      original: { part: 200, price: 200 },
      withFrame: { part: 200, price: 200 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 69, price: 69 },
    backCover: { part: 59, price: 59 }
  },
  "S9 Plus": {
    screenRepair: {
      original: { part: 219, price: 219 },
      withFrame: { part: 219, price: 219 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 59, price: 59 }
  },

  // S8 Series
  "S8": {
    screenRepair: {
      original: { part: 189, price: 189 },
      withFrame: { part: 189, price: 189 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 59, price: 59 },
    backCover: { part: 59, price: 59 }
  },
  "S8 Plus": {
    screenRepair: {
      original: { part: 209, price: 209 },
      withFrame: { part: 209, price: 209 }
    },
    battery: { part: 59, price: 59 },
    chargingPort: { part: 59, price: 59 },
    backCover: { part: 59, price: 59 }
  },

  // Note Series
  "Note 20 Ultra": {
    screenRepair: {
      original: { part: 339, price: 339 },
      withFrame: { part: 339, price: 339 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 55, price: 55 },
    backCover: { part: 59, price: 59 }
  },
  "Note20": {
    screenRepair: {
      original: { part: 229, price: 229 },
      withFrame: { part: 229, price: 229 }
    },
    battery: { part: 69, price: 69 },
    chargingPort: { part: 55, price: 55 },
    backCover: { part: 59, price: 59 }
  },
  "Note 10 lite": {
    screenRepair: {
      original: { part: 200, price: 200 },
      withFrame: { part: 200, price: 200 }
    },
    battery: { part: 65, price: 65 },
    chargingPort: { part: 55, price: 55 },
    backCover: { part: 59, price: 59 }
  },
  "Note 10 Plus": {
    screenRepair: {
      original: { part: 310, price: 310 },
      withFrame: { part: 310, price: 310 }
    },
    battery: { part: 65, price: 65 },
    chargingPort: { part: 55, price: 55 },
    backCover: { part: 59, price: 59 }
  },
  "Note 10": {
    screenRepair: {
      original: { part: 259, price: 259 },
      withFrame: { part: 259, price: 259 }
    },
    battery: { part: 60, price: 60 },
    chargingPort: { part: 55, price: 55 },
    backCover: { part: 59, price: 59 }
  },
  "Note 9": {
    screenRepair: {
      original: { part: 249, price: 249 },
      withFrame: { part: 249, price: 249 }
    },
    battery: { part: 60, price: 60 },
    chargingPort: { part: 59, price: 59 },
    backCover: { part: 49, price: 49 }
  },
  "Note 8": {
    screenRepair: {
      original: { part: 239, price: 239 },
      withFrame: { part: 239, price: 239 }
    },
    battery: { part: 60, price: 60 },
    chargingPort: { part: 69, price: 69 },
    backCover: { part: 49, price: 49 }
  },

  // A Series (using mid-range values from the ranges provided)
  "Galaxy A(2015)": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Galaxy A(2016)": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Galaxy A(2017)": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Galaxy A(2018)": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Ax0": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Ax1": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Ax2": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Ax3": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Ax4": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Ax5": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },
  "Ax6": {
    screenRepair: {
      original: { part: 160, price: 160 },
      withFrame: { part: 160, price: 160 }
    },
    battery: { part: 70, price: 70 },
    chargingPort: { part: 70, price: 70 },
    backCover: { part: 70, price: 70 }
  },

  // Fold/Flip Series (keeping original prices as no iRescue data was provided)
  "Z Flip 4": {
    screenRepair: {
      original: { part: 480, price: 480 },
      withFrame: { part: 480, price: 480 }
    },
    battery: { part: 89, price: 89 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 79, price: 79 }
  },
  "Z Flip 5": {
    screenRepair: {
      original: { part: 480, price: 480 },
      withFrame: { part: 480, price: 480 }
    },
    battery: { part: 89, price: 89 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 79, price: 79 }
  },
  "Z Fold 4": {
    screenRepair: {
      original: { part: 699, price: 699 },
      withFrame: { part: 210, price: 210 }
    },
    battery: { part: 89, price: 89 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 79, price: 79 }
  },
  "Z Fold 5": {
    screenRepair: {
      original: { part: 669, price: 669 },
      withFrame: { part: 180, price: 180 }
    },
    battery: { part: 89, price: 89 },
    chargingPort: { part: 79, price: 79 },
    backCover: { part: 79, price: 79 }
  }
};

// Combined pricing data
const pricingData = {
  Apple: iphonePricing,
  Samsung: samsungPricing,
  Xiaomi: xiaomiPricing,
};

// Issue-to-property mapping
const issueToProperty = {
  "Επισκευή Οθόνης": "screenRepair",
  "Αντικατάσταση Μπαταρίας": "battery",
  "Επισκευή Κάμερας": "camera", 
  "Επισκευή Θύρας Φόρτισης": "chargingPort",
  "Πίσω καπάκι / πλαίσιο": "backCover"
};

// Issue mapping
const commonIssues = [
  { title: "Επισκευή Οθόνης", icon: "🔧", price: "από 89€" },
  { title: "Αντικατάσταση Μπαταρίας", icon: "🔋", price: "από 49€" },
  { title: "Επισκευή Κάμερας", icon: "📸", price: "από 47€" },
  { title: "Επισκευή Θύρας Φόρτισης", icon: "🔌", price: "από 69€" },
  { title: "Πίσω καπάκι / πλαίσιο", icon: "🔧", price: "από 69€" },
];

// Step titles and descriptions
const stepTitles: Record<number,string> = {
  1: "Ποιο κινητό θέλετε να επισκευάσετε;",
  2: "Επιλέξτε το Μοντέλο σας",
  3: "Τι πρόβλημα έχει το κινητό σας;",
  4: "Ολοκληρώστε την Κράτηση",
};

const stepDescriptions: Record<number,string> = {
  1: "Επιλέξτε την εταιρεία του κινητού σας για να ξεκινήσετε",
  2: "Επιλέξτε το μοντέλο του κινητού σας",
  3: "Επιλέξτε το πρόβλημα που αντιμετωπίζετε",
  4: "Συμπληρώστε τα στοιχεία σας για να ολοκληρώσετε την κράτηση",
};

// Near the top of the file, before the component definition, add this type
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

export default function RepairPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [otherIssueSelected, setOtherIssueSelected] = useState<boolean>(false);
  const [otherIssueDescription, setOtherIssueDescription] = useState<string>("");

  // Add event listener for navigateBack event
  useEffect(() => {
    // Check URL params for step
    const checkUrlStep = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const stepParam = urlParams.get('step');
      if (stepParam) {
        const stepNumber = parseInt(stepParam);
        if (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= 4) {
          setStep(stepNumber);
        }
      }
    };
    
    // Check URL params initially
    checkUrlStep();

    // Also check when URL changes (for history navigation)
    window.addEventListener('popstate', checkUrlStep);

    // Handle navigateBack event
    const handleNavigateBack = (e: CustomEvent) => {
      const { pageId, targetStep } = e.detail;
      if (pageId === 1 && targetStep === 3) {
        setStep(3);
      }
    };

    window.addEventListener('navigateBack', handleNavigateBack as EventListener);
    
    return () => {
      window.removeEventListener('navigateBack', handleNavigateBack as EventListener);
      window.removeEventListener('popstate', checkUrlStep);
    };
  }, []);

  // Get price for a specific issue based on the selected device
  const getPriceForIssue = (issue: string): number => {
    if (selectedBrand === "Αλλο") {
      return 0; // "Ας το δούμε μαζί" case
    }

    const brand = selectedBrand as keyof typeof pricingData;
    const brandPricing = pricingData[brand];
    if (!brandPricing) return getDefaultPriceForIssue(issue);

    const modelPricing = brandPricing[selectedModel];
    if (!modelPricing) return getDefaultPriceForIssue(issue);

    const propertyName = issueToProperty[issue as keyof typeof issueToProperty];
    if (!propertyName || !modelPricing[propertyName as keyof RepairPricing]) {
      return getDefaultPriceForIssue(issue);
    }

    const repairInfo = modelPricing[propertyName as keyof RepairPricing];
    
    // Handle screen repair which has multiple options
    if (propertyName === "screenRepair" && typeof repairInfo === "object" && !("price" in repairInfo)) {
      // Choose the first option available for screen repair
      const firstOption = Object.values(repairInfo as ScreenRepairOptions)[0];
      return firstOption.price;
    }
    
    return (repairInfo as PriceInfo).price;
  };

  // Default price fallback for issues
  const getDefaultPriceForIssue = (issue: string): number => {
    const defaultPrices: Record<string, number> = {
      "Επισκευή Οθόνης": 0,
      "Αντικατάσταση Μπαταρίας": 0,
      "Επισκευή Κάμερας": 0,
      "Επισκευή Θύρας Φόρτισης": 0,
      "Πίσω καπάκι / πλαίσιο": 0
    };
    return defaultPrices[issue] || 0; // Return 100 as default if the issue is not found
  };

  // Get price display for an issue
  const getPriceDisplay = (issue: string): string => {
    if (selectedBrand === "Αλλο") {
      return "Ας το δούμε μαζί";
    }
    
    const price = getPriceForIssue(issue);
    return price > 0 ? `${price}€` : "Ας το δούμε μαζί";
  };

  const calculateTotal = () => {
    return selectedIssues.reduce((total, issue) => {
      if (selectedBrand === "Αλλο") return total;
      return total + getPriceForIssue(issue);
    }, 0);
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setStep(2);
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setStep(3);
  };

  const handleIssueSelect = (issue: string, description?: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );

    if (description) {
      setOtherIssueSelected(true);
      setOtherIssueDescription(issue);
    }
  };

  // Update the function to use the BookingData type instead of any
  const handleRepairComplete = async (data: BookingData) => {
    console.log("Η κράτηση ολοκληρώθηκε:", {
      device: { brand: selectedBrand, model: selectedModel },
      issues: selectedIssues,
      booking: data,
    });

    // Send notification to admin about the new repair request
    try {
      const response = await fetch('/api/notifications/repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: selectedBrand,
          model: selectedModel,
          issues: selectedIssues,
          customerName: data.contactInfo.name,
          customerEmail: data.contactInfo.email,
          customerPhone: data.contactInfo.phone,
          date: data.date,
          timeSlot: data.timeSlot,
          totalAmount: calculateTotal(),
          notes: data.contactInfo.notes,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send admin notification');
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-[80%] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-16 mx-auto">
            {Object.keys(phoneOptions).map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandSelect(brand)}
                className="w-full h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:scale-105  dark:hover:bg-purple-900"
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
                className="p-4 dark:text-white text-gray-600 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105 text-left dark:hover:bg-purple-900"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {commonIssues.map((issue) => (
                <button
                  key={issue.title}
                  onClick={() => handleIssueSelect(issue.title)}
                  className={`p-6 rounded-xl text-left transition-all hover:shadow-md hover:scale-105 dark:hover:bg-purple-900
                  ${
                    selectedIssues.includes(issue.title)
                      ? "bg-purple-200 dark:bg-purple-900 border-2 border-purple-500 scale-105"
                      : "bg-white dark:bg-gray-800 hover:shadow-md"
                  }`}
                >
                  <span className="text-3xl mb-4 block">{issue.icon}</span>
                  <h3 className="font-medium mb-2 dark:text-white text-gray-600">
                    {issue.title}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-500">{getPriceDisplay(issue.title)}</p>
                </button>
              ))}
              <button
                className={`p-6 rounded-xl text-left transition-all ${
                  otherIssueSelected && otherIssueDescription.length > 0
                    ? "bg-purple-100 dark:bg-purple-900 border-2 border-purple-500"
                    : "bg-white dark:bg-gray-800 hover:shadow-md"
                }`}
              >
                <span className="text-3xl mb-4 block">❔</span>
                <h3 className="font-medium mb-2 dark:text-white text-gray-600">
                  Άλλο
                </h3>
                <input
                  placeholder="Περιγραφή του προβλήματος"
                  onChange={(e) => handleIssueSelect(e.target.value, "Άλλο")}
                  type="text"
                  value={otherIssueDescription}
                  className="p-2 rounded-lg dark:bg-gray-600 bg-gray-200 text-gray-600 dark:text-white border-gray-900 w-[200px]"
                />
                <p className="text-purple-600 dark:text-purple-500">Ας το δούμε μαζί!</p>
              </button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 mb-6">
              <p>* Οι παραπάνω τιμές είναι ενδεικτικές. Η τελική τιμή θα διαμορφωθεί βάσει της διαθεσιμότητας του ανταλλακτικού.</p>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-purple-600 hover:text-purple-700"
              >
                ← Πίσω στα μοντέλα
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={selectedIssues.length === 0}
                className={`px-8 py-3 rounded-lg ${
                  selectedIssues.length > 0
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Συνέχεια στην Κράτηση →
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <PaymentSection
            totalAmount={calculateTotal()}
            itemDetails={selectedIssues.map((issue) => ({
              title: `${selectedBrand} ${selectedModel} - ${issue}`,
              price: selectedBrand === "Αλλο" ? 0 : getPriceForIssue(issue),
            }))}
            onComplete={(data) => {
              handleRepairComplete(data);
            }}
            pageId={1}
            repair={true}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden w-full flex flex-col justify-center items-center  min-h-[100dvh] bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 dark:text-white text-gray-600">
            {stepTitles[step]}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {stepDescriptions[step]}
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex justify-between mb-2">
            {["Εταιρεία", "Μοντέλο", "Βλάβες", "Κράτηση"].map((label, index) => (
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

        {renderStep()}
      </main>
      {/* Footer - add slight transparency */}
      <footer className="py-5 flex items-center justify-center gap-8 text-sm text-gray-700 dark:text-gray-400 border-t border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400">Πολιτική Απορρήτου & Όροι Χρήσης</Link>
          <Link href="/faq" className="hover:text-purple-600 dark:hover:text-purple-400">Συχνές Ερωτήσεις</Link>
      </footer>
    </div>
  );
}