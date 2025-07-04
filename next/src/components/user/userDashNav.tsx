import { BsTicketDetailed } from "react-icons/bs";
import { LuTicketCheck } from "react-icons/lu";
import { TbTicketOff } from "react-icons/tb";

export default function UserDashNav({
  activeTab,
  changeStatus,
}: {
  activeTab: number;
  changeStatus: (status: number) => void;
}) {
  return (
    <nav className="flex border-b">
      <button
        className={`py-2 px-4 flex text-lg items-center gap-2 ${
          activeTab === 1
            ? "border-b-2 border-blue-500 font-medium text-stone-800"
            : "text-stone-500"
        }`}
        onClick={() => changeStatus(1)}
      >
        <BsTicketDetailed />
        Upcoming
      </button>
      <button
        className={`py-2 px-4 flex text-lg items-center gap-2 ${
          activeTab === 2
            ? "border-b-2 border-blue-500 font-medium text-stone-800"
            : "text-stone-500"
        }`}
        onClick={() => changeStatus(2)}
      >
        <TbTicketOff />
        Cancelled
      </button>
      <button
        className={`py-2 px-4 flex text-lg items-center gap-2 ${
          activeTab === 3
            ? "border-b-2 border-blue-500 font-medium text-stone-800"
            : "text-stone-500"
        }`}
        onClick={() => changeStatus(3)}
      >
        <LuTicketCheck />
        Completed
      </button>
    </nav>
  );
}
