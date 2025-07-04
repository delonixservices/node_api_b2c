'use client';
import React from 'react';

const values = [
    { title: '🙋‍♂️ Customer First', description: 'We prioritize your needs, preferences, and convenience above all. From user-friendly booking experiences to reliable customer support, our focus is always on delivering value and satisfaction.' },
    { title: '🔍 Transparency', description: 'We believe in clear communication and honest pricing—no hidden charges, no misleading offers. Our users always know what they are paying for and why.' },
    { title: '🤝 Integrity', description: 'We operate with honesty and fairness in every transaction, partnership, and policy. Ethical conduct is non-negotiable at every level of our business.' },
    { title: '💡 Innovation', description: 'We\'re committed to evolving with technology and market needs, continuously improving our platform to make travel easier, faster, and smarter for everyone.' },
    { title: '🛡️ Reliability', description: 'You can count on us. Whether it\'s booking a last-minute flight or resolving a cancellation, we deliver consistent and dependable service, 24/7.' },
    { title: '✅ Accountability', description: 'We take full responsibility for the experiences we create. From service delays to technical issues, we own the process and ensure fair resolutions.' },
    { title: '🌍 Social Responsibility', description: 'We aim to promote responsible travel, support local communities, and encourage sustainability in tourism wherever possible.' },
  ];

const ValuesAndEthics: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {values.map((value, index) => (
        <div
          key={index}
          className="bg-white shadow-lg rounded-lg p-6 text-center border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{value.title}</h3>
          <p className="text-gray-600 text-left">{value.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ValuesAndEthics;