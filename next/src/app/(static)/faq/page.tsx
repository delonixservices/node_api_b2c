"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How can I book a tour package with Trip Bazaar?",
    answer: "You can book directly through our website tripbazaar.in, call us at 7678105666, or chat with our travel experts for customized packages.",
  },
  {
    question: "Are Trip Bazaar's packages customizable?",
    answer: "Absolutely! We offer fully customizable itineraries to match your budget, interests, and travel dates.",
  },
  {
    question: "Is it safe to book international trips with Trip Bazaar?",
    answer: "Yes, we ensure a safe and secure travel experience with verified partners, expert guidance, and full documentation support for international tours.",
  },
  {
    question: "What makes Trip Bazaar different from other travel agencies?",
    answer: "Trip Bazaar offers personalized tour planning, 24/7 customer support, and competitive pricing with a focus on hassle-free and memorable travel experiences.",
  },
  {
    question: "Does Trip Bazaar offer both domestic and international tour packages?",
    answer: "Yes, Trip Bazaar specializes in both domestic and international tour packages tailored to suit every traveler's needs and preferences.",
  },
  {
    question: "What payment options does Trip Bazaar accept?",
    answer: "We accept Google Pay, UPI, credit/debit cards, net banking, and direct bank transfers.",
  },
  {
    question: "Do you provide visa assistance for international tours?",
    answer: "Yes, Trip Bazaar provides complete visa support and documentation guidance for various international destinations.",
  },
  {
    question: "Can I get group discounts on tour bookings?",
    answer: "Yes, we offer special discounts for group bookings, family tours, and corporate packages.",
  },
  {
    question: "Are meals and transport included in the tour packages?",
    answer: "Most packages include meals, hotel stays, and transportation. Specific inclusions are detailed in each package.",
  },
  {
    question: "Does Trip Bazaar offer honeymoon packages?",
    answer: "Yes, we offer specially curated honeymoon packages for domestic and international destinations with romantic inclusions.",
  },
  {
    question: "Is customer support available during the trip?",
    answer: "Yes, we provide 24/7 on-trip assistance to ensure a smooth and stress-free journey.",
  },
  {
    question: "Are flights included in international tour packages?",
    answer: "Flight inclusion depends on the selected package. We provide both with-flight and without-flight options.",
  },
  {
    question: "How early should I book my trip with Trip Bazaar?",
    answer: "It's best to book at least 30-45 days in advance for domestic trips and 60-90 days for international travel to ensure availability and better deals.",
  },
  {
    question: "Do you offer weekend getaway packages?",
    answer: "Yes, we have exciting weekend trips for quick getaways to hill stations, beaches, and adventure spots across India.",
  },
  {
    question: "Can I travel with kids and elderly members with your packages?",
    answer: "Yes, our packages are designed keeping in mind all age groups with appropriate accommodations and travel ease.",
  },
  {
    question: "Is Trip Bazaar registered and licensed to operate tours?",
    answer: "Yes, Trip Bazaar is a registered travel company with all required licenses and certifications.",
  },
  {
    question: "Do you provide travel insurance with the package?",
    answer: "Travel insurance can be added upon request for both domestic and international tours.",
  },
  {
    question: "How do I cancel or reschedule a trip?",
    answer: "You can cancel or reschedule your trip by contacting our team. Policies may vary based on the package and destination.",
  },
  {
    question: "Can I book only hotel or transport services with Trip Bazaar?",
    answer: "Yes, you can book standalone services like hotels, flights, transport, or even guided tours through us.",
  },
  {
    question: "Where can I read reviews about Trip Bazaar services?",
    answer: "You can find verified customer reviews on our website, Google, Facebook, and travel platforms.",
  },
];

export default function PaymentsFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-medium text-black mb-6 border-b pb-4">Payments</h2>
      {faqs.map((faq, index) => (
        <div key={index} className="border-b">
          <button
            onClick={() => toggle(index)}
            className="w-full text-left py-4 flex justify-between items-center"
          >
            <span className="text-base font-medium text-gray-800">{faq.question}</span>
            <span className="text-2xl text-gray-500">{openIndex === index ? "−" : "+"}</span>
          </button>
          {openIndex === index && (
            <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-line">
              {faq.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}