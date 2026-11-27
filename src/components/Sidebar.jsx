import { useState } from "react";

const menuItems = [
  {
    id: "home",
    label: "หน้าแรก",
    icon: "home",
  },
  {
    id: "map",
    label: "แผนที่",
    icon: "map",
  },

  {
    id: "compare",
    label: "เปรียบเทียบเขต",
    icon: "compare",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "dashboard",
  },
];

function MenuIcon({ type }) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
        <path d="M9 3v15M15 6v15" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 6-7" />
      </>
    ),
    compare: (
      <>
        <rect x="3" y="4" width="8" height="16" rx="1" />
        <rect x="14" y="4" width="7" height="16" rx="1" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="11" width="7" height="10" rx="1" />
        <rect x="3" y="14" width="8" height="7" rx="1" />
      </>
    ),
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[type]}
    </svg>
  );
}

function Sidebar({ onNavigate }) {
  const [active, setActive] = useState("home");

  const handleNavigate = (id) => {
    setActive(id);
    onNavigate?.(id);
  };

  return (
    <aside className="w-[160px] min-h-[calc(100vh-67px)] flex shrink-0 bg-[#819B77]">
      {/* เมนู */}
      <nav className="flex-1 px-1.5 pt-5 flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={`
              w-full h-[34px] px-2.5
              flex items-center gap-2
              rounded-md text-left
              transition-all
              ${
                active === item.id
                  ? "bg-[#536F4C] text-[#FAF5EC]"
                  : "text-[#F5F1E6] hover:bg-[#6D8964]"
              }
            `}
          >
            <span className="shrink-0">
              <MenuIcon type={item.icon} />
            </span>

            <span className="text-[15px] whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
