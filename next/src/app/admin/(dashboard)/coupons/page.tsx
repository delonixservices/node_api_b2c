'use client';


import React, { useEffect, useState, useCallback } from 'react';
import { RiCloseLargeFill } from 'react-icons/ri';


type Coupon = {
  _id?: string;
  name: string;
  from: string;
  to: string;
  value: string;
  type: string;
  code: string;
  product: string;
  created_at?: string;
  updated_at?: string;
  used: number;
  CompleteUsed: number;
  isGlobal: boolean;
};


export default function AdminCoupons() {
  const [addCoupon, setAddCoupon] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);


  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/coupons`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  }, []);


  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/coupons/?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c._id !== id));
      } else {
        console.error('Failed to delete coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  }, []);


  const exportToCSV = useCallback(() => {
    const headers = [
      '_id', 'name', 'from', 'to', 'code', 'value', 'type', 'product', 'isGlobal', 'created_at', 'updated_at', 'used', 'CompleteUsed'
    ];
    const rows = coupons.map(c => [
      c._id, c.name, c.from, c.to, c.code, c.value, c.type, c.product, c.isGlobal, c.created_at, c.updated_at, c.used, c.CompleteUsed
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'coupons.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [coupons]);


  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);


  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 px-2 border-b border-gray-200 pb-2">
        <h2 className="uppercase text-2xl text-gray-500">All Coupon Code</h2>
        <div className="space-x-2">
          <button
            className="bg-purple-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => { setSelectedCoupon(null); setAddCoupon(true); }}
          >
            Add Coupon
          </button>
          <button
            className="bg-fuchsia-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={exportToCSV}
          >
            Export As CSV
          </button>
        </div>
      </div>


      <AddCouponModal
        isOpen={addCoupon}
        onClose={useCallback((status: boolean) => { setAddCoupon(false); if (status) fetchCoupons(); }, [fetchCoupons])}
        initialData={selectedCoupon}
      />


      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">From</th>
              <th className="px-4 py-2 border">To</th>
              <th className="px-4 py-2 border">Code</th>
              <th className="px-4 py-2 border">Value</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Product</th>
              <th className="px-4 py-2 border">Global</th>
              <th className="px-4 py-2 border">Used</th>
              <th className="px-4 py-2 border">Complete Used</th>
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon._id} className="text-sm text-center">
                <td className="px-4 py-2 border">{coupon.name}</td>
                <td className="px-4 py-2 border">{new Date(coupon.from).toLocaleString()}</td>
                <td className="px-4 py-2 border">{new Date(coupon.to).toLocaleString()}</td>
                <td className="px-4 py-2 border">{coupon.code}</td>
                <td className="px-4 py-2 border">{coupon.value}</td>
                <td className="px-4 py-2 border">{coupon.type}</td>
                <td className="px-4 py-2 border">{coupon.product}</td>
                <td className="px-4 py-2 border">{coupon.isGlobal ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 border">{coupon.used}</td>
                <td className="px-4 py-2 border">{coupon.CompleteUsed}</td>
                <td className="px-4 py-2 border relative">
                  <div className="relative inline-block text-left">
                    <div>
                      <button
                       onClick={() => coupon._id && setDropdownOpenId(dropdownOpenId === coupon._id ? null : coupon._id)}


                        className="inline-flex w-full justify-center rounded-md bg-gray-600 px-4 py-1 text-sm font-medium text-white shadow-sm hover:bg-gray-700"
                      >
                        Action ▾
                      </button>
                    </div>


                    {dropdownOpenId === coupon._id && (
                      <div className="absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setAddCoupon(true);
                              setDropdownOpenId(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => {
                              handleDelete(coupon._id!);
                              setDropdownOpenId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// Modal Component
const AddCouponModal = ({
  isOpen,
  onClose,
  initialData,
}: {
  isOpen: boolean;
  onClose: (status: boolean) => void;
  initialData?: Coupon | null;
}) => {
  const [couponObj, setCouponObj] = useState<Coupon>({
    name: '',
    from: '',
    to: '',
    value: '',
    type: 'Percentage',
    code: '',
    product: 'Hotel',
    used: 0,
    CompleteUsed: 0,
    isGlobal: false,
  });


  useEffect(() => {
    if (initialData) setCouponObj(initialData);
    else setCouponObj({
      name: '',
      from: '',
      to: '',
      value: '',
      type: 'Percentage',
      code: '',
      product: 'Hotel',
      used: 0,
      CompleteUsed: 0,
      isGlobal: false,
    });
  }, [initialData]);


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const method = couponObj._id ? 'PUT' : 'POST';
    const url = `${process.env.NEXT_PUBLIC_API_PATH}/admin/coupons`;
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(couponObj),
      });
      if (res.ok) {
        onClose(true);
      } else {
        console.error('Failed to submit coupon');
      }
    } catch (error) {
      console.error('Error submitting coupon:', error);
    }
  }, [couponObj, onClose]);


  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px]">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold">{couponObj._id ? 'Edit' : 'Add'} Coupon</h4>
          <button onClick={() => onClose(false)} className="text-gray-500 hover:text-gray-700">
            <RiCloseLargeFill />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Coupon Name" value={couponObj.name} onChange={val => setCouponObj({ ...couponObj, name: val })} />
          <div className="grid grid-cols-2 gap-4">
            <Input type="datetime-local" label="Start Date" value={couponObj.from} onChange={val => setCouponObj({ ...couponObj, from: val })} />
            <Input type="datetime-local" label="End Date" value={couponObj.to} onChange={val => setCouponObj({ ...couponObj, to: val })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Value" value={couponObj.value} onChange={val => setCouponObj({ ...couponObj, value: val })} />
            <Select label="Type" value={couponObj.type} options={['Percentage', 'Fixed']} onChange={val => setCouponObj({ ...couponObj, type: val })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Coupon Code" value={couponObj.code} onChange={val => setCouponObj({ ...couponObj, code: val })} />
            <Select label="Product" value={couponObj.product} options={['Hotel', 'Flights']} onChange={val => setCouponObj({ ...couponObj, product: val })} />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isGlobal"
              checked={couponObj.isGlobal}
              onChange={(e) => setCouponObj({ ...couponObj, isGlobal: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isGlobal" className="text-sm font-medium text-gray-700">
              Is Global Coupon
            </label>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            {couponObj._id ? 'Update' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};


// Input Field
const Input = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
    />
  </div>
);


// Select Dropdown
const Select = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
