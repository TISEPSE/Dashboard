'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CryptoDashboardClient() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'eur',
          order: 'market_cap_desc',
          per_page: 13, // Change ici si tu veux + ou - de cryptos
          page: 1,
          price_change_percentage: '1h,24h,7d',
        },
      })
      .then((res) => {
        setCryptos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(true);
      });
  }, []);

  if (loading) {
    return (
      <p className="flex items-center justify-center min-h-screen text-[2em]">
        Chargement...
      </p>
    );
  }

  // Divise les cryptos en 3 groupes, 1 rempli au max d'abord
  const splitIntoThreeCarousels = (array) => {
    const total = array.length;
    const part = Math.ceil(total / 3);
    return [
      array.slice(0, part),
      array.slice(part, part * 2),
      array.slice(part * 2),
    ];
  };

  const groups = splitIntoThreeCarousels(cryptos);

  const Variation = ({ label, value }) => (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-gray-400">{label}</span>
      <span
        className={`font-semibold px-2 py-0.5 rounded-full ${
          value >= 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
        }`}
      >
        {value?.toFixed(2)}%
      </span>
    </div>
  );

  const renderCard = (coin) => (
    <div
      key={coin.id}
      className="bg-[#2a2d3e] rounded-xl p-4 w-64 flex-shrink-0 flex flex-col justify-between"
    >
      <div className="flex justify-between gap-2">
        <div className="w-2/3 break-words">
          <img src={coin.image} alt={coin.name} className="w-7 h-7 mb-2" />
          <span className="text-[#d1d1d1] text-base font-semibold block truncate">
            {coin.name} ({coin.symbol.toUpperCase()})
          </span>
          <span className="text-lg block mt-1">{coin.current_price} €</span>
        </div>
        <div className="w-1/3 flex flex-col items-end gap-1 mt-1">
          <Variation label="1h" value={coin.price_change_percentage_1h_in_currency} />
          <Variation label="24h" value={coin.price_change_percentage_24h_in_currency} />
          <Variation label="7j" value={coin.price_change_percentage_7d_in_currency} />
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-3">
        <button className="btn btn-base btn-outline btn-error w-24">Ajouter</button>
        <button className="btn btn-base btn-outline btn-info w-24">Info</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-[#FeFeFe] bg-[#212332] px-4 py-6">
      <div className="flex items-center justify-center">
        <h1 className="font-bold text-lg mb-6 bg-[#3A6FF8] p-4 rounded-xl">
          Top {cryptos.length} des cryptos du moment
        </h1>
      </div>

      {groups.map((group, idx) =>
        group.length > 0 ? (
          <div
            key={idx}
            className="flex overflow-x-auto gap-3 scroll-smooth flex-no-scrollbar mb-6"
          >
            {group.map(renderCard)}
          </div>
        ) : null
      )}
    </div>
  );
}
