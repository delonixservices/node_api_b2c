import React from "react";

const ReviewSection: React.FC = React.memo(() => (
  <section className="container mx-auto px-6 py-8 bg-white shadow-md rounded-2xl">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">Reviews</h2>
    <div className="h-72 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 italic text-center">Reviews coming soon...</p>
      </div>
    </div>
  </section>
));
ReviewSection.displayName = "ReviewSection";
export default ReviewSection; 