'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { constructImageUrl } from '@/utils/urlUtils';

type Banner = {
  _id: string;
  name: string;
  from: string;
  to: string;
  url: string;
  image: string; // Direct image URL
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    _id: '',
    name: '',
    from: '',
    to: '',
    url: '',
    image: null as File | null,
  });

  const [token, setToken] = useState('');

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/flight-offers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      const bannerList = result?.data || [];

      const updatedBanners = bannerList.map((banner: Banner) => ({
        ...banner,
        image: constructImageUrl(process.env.NEXT_PUBLIC_BANNER_API || '', banner.image),
      }));

      setBanners(updatedBanners);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [token]);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (token) fetchBanners();
  }, [token, fetchBanners]);

  const resetForm = () => {
    setForm({
      _id: '',
      name: '',
      from: '',
      to: '',
      url: '',
      image: null,
    });
  };

  const openEdit = (banner: Banner) => {
    setForm({
      _id: banner._id,
      name: banner.name,
      from: banner.from.split('T')[0],
      to: banner.to.split('T')[0],
      url: banner.url,
      image: null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('from', form.from);
    formData.append('to', form.to);
    formData.append('url', form.url);
    formData.append('_id', form._id || '');
    formData.append('type', 'upload');
    if (form.image) formData.append('image', form.image);

    const method = form._id ? 'PUT' : 'POST';

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/flight-offers`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        fetchBanners();
        setModalOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDelete = async (_id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/flight-offers?id=${_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchBanners();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Flights Offers</h1>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Offer
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">S.No</th>
            <th className="p-2 border">Offer Name</th>
            <th className="p-2 border">From</th>
            <th className="p-2 border">To</th>
            <th className="p-2 border">URL</th>
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner, index) => (
            <tr key={banner._id} className="border-t">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{banner.name}</td>
              <td className="p-2 border">{new Date(banner.from).toLocaleDateString()}</td>
              <td className="p-2 border">{new Date(banner.to).toLocaleDateString()}</td>
              <td className="p-2 border">
                <a href={banner.url} className="text-blue-600 underline" target="_blank">
                  {banner.url}
                </a>
              </td>
              <td className="p-2 border">
                <Image
                  src={banner.image}
                  alt="banner"
                  className="w-28 h-16 object-contain border rounded"
                  width={112}
                  height={64}
                  unoptimized
                />
              </td>
              <td className="p-2 border">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(banner)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full sm:w-[400px] h-full p-6 shadow-lg space-y-4 overflow-y-auto"
          >
            <h2 className="text-lg font-semibold mb-2">
              {form._id ? 'Edit Banner' : 'Add Banner'}
            </h2>

            <input
              type="text"
              placeholder="Offer Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />

            <input
              type="date"
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />

            <input
              type="date"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="URL"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, image: e.target.files ? e.target.files[0] : null })
              }
              className="w-full"
            />

            <div className="flex justify-between">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Submit
              </button>
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}