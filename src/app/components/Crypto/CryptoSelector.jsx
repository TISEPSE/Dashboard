export default function CryptoSelector({ value, onChange }) {
  const options = [
    { value: 10, label: "10 Crypto" },
    { value: 20, label: "20 Crypto" },
    { value: 30, label: "30 Crypto" },
    { value: 50, label: "50 Crypto "},
    { value: 100, label: "100 Crypto" },
  ]

  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="appearance-none bg-[#2a2d3e] border border-[#3A6FF8] text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-colors duration-200 hover:bg-[#2a2d3e]"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
