// Composant CryptoSelector bien structuré
export default function CryptoSelector({ value, onChange }) {
  const options = [
    { value: 10, label: "10 par page" },
    { value: 20, label: "20 par page" },
    { value: 30, label: "30 par page" },
    { value: 50, label: "50 par page" },
    { value: 100, label: "100 par page" },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="bg-[#2a2d3e] border border-[#3A6FF8] text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent ml-4"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
