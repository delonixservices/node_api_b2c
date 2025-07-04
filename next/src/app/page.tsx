'use client';

import { useEffect, useState } from 'react';
import Footer from "@/components/footer";
import Header from "@/components/header";
import HotelSearch from "@/components/hotel/hotelSearch";
import Image from 'next/image';
import clsx from 'clsx';
import { constructImageUrl } from '@/utils/urlUtils';
import DestinationFooter from "@/components/DestinationFooter";

interface Banner {
  _id: string;
  name: string;
  image: string;
  from?: string;
  to?: string;
  url?: string;
  type?: string;
}

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [holidayPackages, setHolidayPackages] = useState<Banner[]>([]);
  const [popularHotels, setPopularHotels] = useState<Banner[]>([]);
  const [flightOffers, setFlightOffers] = useState<Banner[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Banner[]>([]);
  const [activeTab, setActiveTab] = useState<'hotels' | 'all' | 'flights' | 'holidays' | 'special'>('hotels');

  // Utility function to properly construct image URLs
  const constructImageUrlLocal = (imagePath: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_BANNER_API || '';
    return constructImageUrl(baseUrl, imagePath);
  };

  useEffect(() => {
    async function fetchAll() {
      try {
        const bannersRes = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/site/allbanner`);
        const bannersResult = await bannersRes.json();
        const updatedBanners = (bannersResult?.data || []).map((banner: Banner) => ({
          ...banner,
          image: constructImageUrlLocal(banner.image),
        }));
        setBanners(updatedBanners);
      } catch (err) {
        console.error('Fetch banner error:', err);
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/site/holidaypackage`);
        const result = await res.json();
        const updated = (result?.data || []).map((item: Banner) => ({
          ...item,
          image: constructImageUrlLocal(item.image),
        }));
        setHolidayPackages(updated);
      } catch (err) {
        console.error('Fetch holiday error:', err);
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/site/popularhotel`);
        const result = await res.json();
        const updated = (result?.data || []).map((item: Banner) => ({
          ...item,
          image: constructImageUrlLocal(item.image),
        }));
        setPopularHotels(updated);
      } catch (err) {
        console.error('Fetch popular hotel error:', err);
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/offers-flight`);
        const result = await res.json();
        const updated = (result?.data || []).map((item: Banner) => ({
          ...item,
          image: constructImageUrlLocal(item.image),
        }));
        setFlightOffers(updated);
      } catch (err) {
        console.error('Fetch flight offers error:', err);
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/site/allspacialoffer`);
        const result = await res.json();
        const updated = (result?.data || []).map((item: Banner) => ({
          ...item,
          image: constructImageUrlLocal(item.image),
        }));
        setSpecialOffers(updated);
      } catch (err) {
        console.error('Fetch special offers error:', err);
      }
    }
    fetchAll();
  }, []);

  // Helper to ensure full URL
  function getFullUrl(url?: string) {
    if (!url) return '#';
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  }

  // Tab navigation
  const tabs = [
    { key: 'hotels', label: 'Hotels' },
    { key: 'all', label: 'All Offers' },
    { key: 'flights', label: 'Flights' },
    { key: 'holidays', label: 'Holidays' },
    { key: 'special', label: 'Special Offers' },
  ];

  // Card layout component
  function OfferCard({ offer, buttonText }: { offer: Banner, buttonText?: string }) {
    return (
      <div className="flex flex-col sm:flex-row bg-white rounded-xl shadow-md overflow-hidden min-h-[180px] relative w-full">
        <div className="w-full sm:w-40 min-w-0 sm:min-w-[160px] flex items-center justify-center bg-gray-100">
          <Image
            src={offer.image || '/images/hotel.jpg'}
            alt={offer.name}
            width={160}
            height={160}
            className="object-cover w-full sm:w-40 h-40 rounded-lg m-2 sm:m-4"
            unoptimized
            onError={(e) => {
              console.error('Image failed to load:', offer.image);
              // Fallback to placeholder
              const target = e.target as HTMLImageElement;
              target.src = '/images/hotel.jpg';
            }}
          />
        </div>
        <div className="flex-1 p-3 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <div className="text-lg sm:text-xl font-extrabold leading-tight mb-1 text-gray-900">
                {offer.name}
              </div>
              <div className="w-8 sm:w-10 h-1 bg-red-500 rounded-full mb-2" />
              <div className="text-gray-700 text-sm sm:text-base mb-2">
                {offer.type || offer.url || ''}
              </div>
            </div>
            <div className="text-xs text-right text-gray-500 font-semibold ml-0 sm:ml-2 whitespace-nowrap mt-2 sm:mt-0">T&amp;C&apos;S APPLY</div>
          </div>
          <div className="flex justify-end mt-2 sm:mt-4">
            <a
              href={getFullUrl(offer.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-bold hover:underline text-base sm:text-lg px-2 py-1 sm:px-0"
            >
              {buttonText || 'VIEW DETAILS'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      {/* SEARCH BAR FULL WIDTH WITH BACKGROUND IMAGE */}
      <div className="w-full bg-cover bg-center" style={{ backgroundImage: 'url(/images/hotel.jpg)' }}>
        <div className="w-full px-0 sm:px-0 md:px-0">
          <HotelSearch />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-nowrap overflow-x-auto items-center gap-4 sm:gap-8 px-2 sm:px-4 pt-6 sm:pt-8 pb-2 border-b border-gray-200 mb-4 scrollbar-thin scrollbar-thumb-gray-300">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mr-4 sm:mr-8 shrink-0">Offers</h1>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={clsx(
              'text-base sm:text-lg font-semibold px-1 sm:px-2 pb-2 border-b-2',
              activeTab === tab.key ? 'text-blue-600 border-blue-500' : 'text-gray-600 border-transparent',
              'focus:outline-none transition-colors duration-200 shrink-0'
            )}
            onClick={() => setActiveTab(tab.key as 'hotels' | 'all' | 'flights' | 'holidays' | 'special')}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <a href="#" className="text-blue-600 font-bold text-base sm:text-lg flex items-center gap-1">VIEW ALL <span className="text-xl">→</span></a>
        </div>
      </div>

      {/* Offers Sections - wider container on desktop */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-6xl">
          {activeTab === 'hotels' && (
            <section className="px-2 sm:px-4 py-4 sm:py-8 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {popularHotels.slice(0, 3).map((hotel) => (
                  <OfferCard key={hotel._id} offer={hotel} buttonText="VIEW DETAILS" />
                ))}
              </div>
            </section>
          )}
          {activeTab === 'flights' && (
            <section className="px-2 sm:px-4 py-4 sm:py-8 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {flightOffers.slice(0, 3).map((flight) => (
                  <OfferCard key={flight._id} offer={flight} buttonText="BOOK NOW" />
                ))}
              </div>
            </section>
          )}
          {activeTab === 'holidays' && (
            <section className="px-2 sm:px-4 py-4 sm:py-8 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {holidayPackages.slice(0, 3).map((pkg) => (
                  <OfferCard key={pkg._id} offer={pkg} buttonText="VIEW DETAILS" />
                ))}
              </div>
            </section>
          )}
          {activeTab === 'special' && (
            <section className="px-2 sm:px-4 py-4 sm:py-8 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {specialOffers.slice(0, 3).map((specialOffer) => (
                  <OfferCard key={specialOffer._id} offer={specialOffer} buttonText="VIEW DETAILS" />
                ))}
              </div>
            </section>
          )}
          {activeTab === 'all' && (
            <section className="px-2 sm:px-4 py-4 sm:py-8 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {banners.slice(0, 3).map((banner) => (
                  <OfferCard key={banner._id} offer={banner} buttonText="VIEW DETAILS" />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <DestinationFooter />
      <Footer />
    </>
  );
}
