
import { useState } from "react";
import logo from "../assets/logo-map.png";

function Header({ onSearch }) {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    onSearch?.(search);
  };

  const handleReset = () => {
    setSearch("");
    onSearch?.("");
  };

  return (
    <header className="w-full h-[67px] px-5 flex items-center gap-[30px] bg-[#FAF5EC] border-b border-[#D6C9C0]">

      {/* Logo */}
      <div className="flex items-center gap-2 w-[194px] shrink-0">

        <img
          src={logo}
          alt="TerraInsight"
          className="w-[55px] h-[55px] object-contain"
        />

        <div className="flex flex-col">
          <h1 className="text-[22px] font-medium tracking-[1px] text-[#79554B] leading-tight">
            TerraInsight
          </h1>

          <p className="text-[9px] text-[#71845D] whitespace-nowrap">
            LIVABILITY FINDER · กรุงเทพฯ
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="flex-1 h-[35px] flex items-center bg-[#EFE9DB] border border-[#C3B2A9] rounded-[7px] px-3">

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="flex-1 w-full h-full outline-none bg-transparent text-sm text-[#51443D]"
        />

        <button
          onClick={handleSearch}
          aria-label="ค้นหา"
          className="text-[#171717] hover:text-[#71845D] transition"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7.5" />
            <path d="m16.5 16.5 5 5" />
          </svg>
        </button>

      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-[75px] h-[29px] flex items-center justify-center gap-1 border border-[#A5B095] rounded-[8px] bg-[#F5F1E6] text-[#71845D] text-[11px] hover:bg-[#E8EBDD] transition shrink-0"
      >
        <span className="text-[17px]">↻</span>
        เริ่มใหม่
      </button>

    </header>
  );
}

export default Header;
