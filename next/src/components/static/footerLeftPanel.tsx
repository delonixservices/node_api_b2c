import Link from 'next/link';
import React from 'react';

const FooterLeftPanel: React.FC = () => {
  const items = [
    { name: 'About Us', link: '/about-us' },
    { name: 'Services', link: '/services' },
    { name: 'Values & Ethics', link: '/values-ethics' },
    { name: 'My Account', link: '/user/account/manage' },
    // { name: 'Products', link: '/products' },
    // { name: "Faq's", link: '/faqs' },
    { name: 'Customer Care', link: '/customer-care' },
    { name: 'Terms & Conditions', link: '/terms' },
    { name: 'Privacy Policy', link: '/privacy-policy' },
    { name: 'Refund Policy', link: '/refund-policy' },
    { name: 'User Agreement', link: '/user-agreement' },
  ];

  return (
    <div className="text-left p-2 w-48">
      <ul className="list-none space-y-2  ">
      {items.map((item, index) => (
          <li key={index}>
            <Link
              href={item.link}
              className="text-base  px-2 py-1 rounded-full font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterLeftPanel;