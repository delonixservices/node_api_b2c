import menus from "@/db/footerMenu.json";
import Link from "next/link";

export default function DestinationFooter() {
  return (
    <footer className="bg-slate-900 text-white relative">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Hotels in India */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-100 border-b border-gray-700 pb-2">
              Hotels in India
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {menus.location[0].subMenu.map((item, i) => (
                <Link
                  key={i}
                  href={item.slug}
                  className="text-gray-400 hover:text-cyan-400 transition-all duration-200 text-sm hover:translate-x-1 inline-block py-0.5"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* International Hotels */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-100 border-b border-gray-700 pb-2">
              International Hotels
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {menus.location[1].subMenu.map((item, i) => (
                <Link
                  key={i}
                  href={item.slug}
                  className="text-gray-400 hover:text-cyan-400 transition-all duration-200 text-sm hover:translate-x-1 inline-block py-0.5"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 