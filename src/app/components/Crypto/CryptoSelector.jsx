export default function CryptoSelector({ value, onChange }) {
  const options = [
    { value: 6, label: "Afficher les 6 premières" },
    { value: 12, label: "Afficher les 12 premières" },
    { value: 18, label: "Afficher les 18 premières" },
    { value: 24, label: "Afficher les 24 premières" },
    { value: 30, label: "Afficher les 30 premières" },
    { value: "all", label: "Afficher tout le marché" },
  ];

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "all") {
      onChange("all");
    } else {
      onChange(Number(val));
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className="appearance-none bg-[#2a2d3e] border border-[#3A6FF8] text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-colors duration-200 hover:bg-[#2a2d3e]"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
