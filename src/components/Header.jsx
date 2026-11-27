import logo from "../assets/logo-map.png";

function Header({ onReset }) {
  const handleReset = () => {
    onReset?.();
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

      {/* ตัวดันปุ่มเริ่มใหม่ไปชิดขวา */}
      <div className="flex-1" />

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